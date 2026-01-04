
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AccentType, StoryData } from "../types";

// Hàm khởi tạo an toàn, không lưu trữ key hay log key
const getSafeClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API key is missing in environment");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const FAST_CONFIG = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    thinkingConfig: { thinkingBudget: 0 } 
};

const CHILD_FRIENDLY_STYLE = "Strictly children-appropriate, rated G content. Cute 2D cartoon illustration for kids, extremely vibrant and bright colors, clean flat vector art style, perfectly isolated on a solid plain white background, NO borders, NO frames, NO circular backgrounds, cute and friendly character design, professional digital art. Ensure no scary, violent, or inappropriate elements.";

/**
 * Hàm hỗ trợ thực hiện lại request khi gặp lỗi 429 (Rate Limit) hoặc 503 (Overloaded)
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || "";
    const status = error.status || "";
    
    // Kiểm tra lỗi 429 (Quota exceeded) hoặc 503 (Service Unavailable/Overloaded)
    const isRetryable = 
      errorMsg.includes("429") || 
      errorMsg.includes("503") || 
      errorMsg.includes("RESOURCE_EXHAUSTED") || 
      errorMsg.includes("UNAVAILABLE") ||
      status === "UNAVAILABLE" ||
      status === "RESOURCE_EXHAUSTED";

    if (isRetryable && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

export const generateCardDetails = async (text: string, accent: AccentType = 'US') => {
  return withRetry(async () => {
    const ai = getSafeClient();
    const accentDesc = accent === 'UK' ? 'British' : 'American';
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: Translate "${text}" for a kid. Ensure the translation and example are 100% appropriate for children.
      JSON ONLY: englishText, phonetic (${accentDesc}), vietnamese, example, topic, emoji.`,
      config: { 
        ...FAST_CONFIG,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            englishText: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            vietnamese: { type: Type.STRING },
            example: { type: Type.STRING },
            topic: { type: Type.STRING },
            emoji: { type: Type.STRING }
          },
          required: ["englishText", "phonetic", "vietnamese", "example", "topic", "emoji"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  });
};

export const suggestTopics = async (text: string): Promise<string[]> => {
  return withRetry(async () => {
    const ai = getSafeClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 simple kids-friendly English topics (e.g. 'Animals', 'Fruit', 'Transport', 'Nature') for the word/phrase: "${text}". Respond ONLY with a JSON array of strings.`,
      config: {
        ...FAST_CONFIG,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateIllustration = async (text: string, refImage?: string): Promise<string | undefined> => {
  return withRetry(async () => {
    const ai = getSafeClient();
    const parts: any[] = [];
    
    if (refImage) {
      parts.push({
        inlineData: {
          data: refImage,
          mimeType: 'image/png',
        },
      });
    }
    
    const prompt = `${CHILD_FRIENDLY_STYLE} Subject: ${text}`;
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { 
          imageConfig: { 
              aspectRatio: "1:1" 
          }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return part.inlineData.data;
    }
    return undefined;
  });
};

export const generateStory = async (words: string[]): Promise<StoryData> => {
  return withRetry(async () => {
    const ai = getSafeClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short 3-page kid story using: ${words.join(', ')}. 
      1. Define a consistent main character "characterDescription" (e.g., 'a cheerful small panda wearing a red scarf').
      2. For each scene, provide a simple "imagePrompt" describing the character doing something in a specific setting.
      JSON ONLY: { 
        "title": "...", 
        "characterDescription": "...",
        "scenes": [ { "text": "...", "vietnamese": "...", "imagePrompt": "..." } ] 
      }`,
      config: { 
        ...FAST_CONFIG,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            characterDescription: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  vietnamese: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["text", "vietnamese", "imagePrompt"]
              }
            }
          },
          required: ["title", "characterDescription", "scenes"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    data.vocabulary = words;
    return data;
  });
};

export const generatePronunciation = async (text: string, accent: AccentType = 'US'): Promise<string | undefined> => {
  try {
    return await withRetry(async () => {
      const ai = getSafeClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }, 3, 1500);
  } catch (e) {
    return undefined;
  }
};
