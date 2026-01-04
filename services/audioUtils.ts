
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
};

// Các URL âm thanh SFX vui nhộn cho bé
const SFX_URLS = {
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    star: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
};

export const playSFX = (type: keyof typeof SFX_URLS) => {
    const audio = new Audio(SFX_URLS[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Bỏ qua nếu trình duyệt chặn tự động phát
};

export const decodeBase64Audio = async (
  base64Data: string,
  audioContext?: AudioContext 
): Promise<AudioBuffer> => {
  const ctx = audioContext || getAudioContext();
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const safeLen = len + (len % 2); 
  const bytes = new Uint8Array(safeLen);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const sampleRate = 24000;
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};

export const playAudioBuffer = (buffer: AudioBuffer, context?: AudioContext) => {
  const ctx = context || getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

const getExpressiveVoice = (lang: 'en' | 'vn', accent: 'US' | 'UK' = 'US') => {
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'vn') return voices.find(v => v.lang.includes('vi')) || null;
    const preferredUS = ['Google US English', 'Microsoft Aria Online', 'Samantha'];
    const preferredUK = ['Google UK English Female', 'Microsoft Sonia Online', 'Daniel'];
    const targetList = accent === 'UK' ? preferredUK : preferredUS;
    for (const name of targetList) {
        const found = voices.find(v => v.name.includes(name));
        if (found) return found;
    }
    const fallbackLang = accent === 'UK' ? 'en-GB' : 'en-US';
    return voices.find(v => v.lang === fallbackLang) || voices.find(v => v.lang.startsWith('en')) || null;
};

interface SpeechOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    accent?: 'US' | 'UK';
}

export const speakWithBrowser = (text: string, lang: 'en' | 'vn' = 'en', options: SpeechOptions = {}) => {
  return new Promise<void>((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const runSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        const bestVoice = getExpressiveVoice(lang, options.accent || 'US');
        if (bestVoice) utterance.voice = bestVoice;
        utterance.lang = lang === 'vn' ? 'vi-VN' : (options.accent === 'UK' ? 'en-GB' : 'en-US');
        utterance.rate = options.rate || 1.0; 
        utterance.pitch = options.pitch || 1.1;
        utterance.volume = options.volume || 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = runSpeak;
    } else {
        runSpeak();
    }
  });
};
