
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, VideoCameraIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, StopIcon, SparklesIcon, LanguageIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Chat } from '@google/genai';
import { LanguageType, FriendMode, ChatMessage, LearningItem, UserProfile } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playSFX } from '../services/audioUtils';

interface AIFriendModalProps {
  onClose: () => void;
  lang: LanguageType;
  items: LearningItem[];
  userProfile: UserProfile;
  fullView?: boolean;
  onReward?: (stars: number) => void;
}

const AIFriendModal: React.FC<AIFriendModalProps> = ({ onClose, lang, items = [], userProfile, fullView = false, onReward }) => {
  const [mode, setMode] = useState<FriendMode>('chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<(ChatMessage & { translated?: string, isTranslating?: boolean })[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const t = TRANSLATIONS[lang];
  const friendName = userProfile.gender === 'girl' ? 'Magic Bluey' : 'Robo Friend';
  const avatarEmoji = userProfile.gender === 'girl' ? '🦄' : '🤖';

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleTranslateMessage = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || msg.translated) return;
    
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTranslating: true } : m));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate this simple message for a ${userProfile.age} year old to Vietnamese: "${msg.text}". Respond ONLY with the translation.`
      });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translated: response.text, isTranslating: false } : m));
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTranslating: false } : m));
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, timestamp: Date.now() }]);
    setIsTyping(true);
    playSFX('click');

    try {
        if (!chatSessionRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatSessionRef.current = ai.chats.create({
                model: "gemini-3-flash-preview",
                config: { 
                  systemInstruction: `You are ${friendName}, a cheerful AI friend for a child named ${userProfile.name} who is ${userProfile.age} years old. 
                  Use lots of emojis. Keep sentences short and simple. Help them practice English. Occasionally correct their English gently if they make mistakes.` 
                }
            });
        }
        const result = await chatSessionRef.current.sendMessage({ message: userText });
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.text || "✨", timestamp: Date.now() }]);
        if (onReward && messages.length % 5 === 0) onReward(2);
        playSFX('pop');
    } catch (e) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Mình đang bận một xíu, bé đợi tí nhé! 🔋", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (fullView) return <div className="h-full w-full flex flex-col bg-white overflow-hidden">{children}</div>;
    return (
      <div className="fixed inset-0 z-[150] bg-blue-900/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6" onClick={onClose}>
        <div className="w-full h-full md:max-w-3xl md:h-[85vh] md:clay-card flex flex-col overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
        <div className="bg-indigo-600 p-4 md:p-8 flex justify-between items-center text-white shrink-0 pt-safe">
            <div className="flex items-center gap-3 md:gap-6">
                {!fullView ? (
                  <button onClick={onClose} className="p-2 bg-white/20 rounded-full md:hidden"><ArrowLeftIcon className="w-6 h-6"/></button>
                ) : null}
                <div className="text-4xl md:text-6xl animate-float shrink-0">{avatarEmoji}</div>
                <div className="min-w-0">
                    <h2 className="text-xl md:text-3xl font-black truncate">{friendName}</h2>
                    <p className="text-indigo-200 font-bold text-[10px] md:text-sm uppercase tracking-wider">Online ✨</p>
                </div>
            </div>
            {!fullView && <button onClick={onClose} className="hidden md:block p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><XMarkIcon className="w-8 h-8"/></button>}
        </div>

        <div className="flex bg-indigo-50/50 p-1 md:p-2 border-b border-indigo-100 shrink-0">
            {[
              { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
              { id: 'voice', label: 'Gọi thoại', icon: MicrophoneIcon },
              { id: 'video', label: 'Video', icon: VideoCameraIcon },
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setMode(m.id as any)} 
                className={`flex-1 py-3 md:py-4 font-black text-xs md:text-sm flex flex-col items-center gap-1 transition-all rounded-2xl ${mode === m.id ? 'text-indigo-600 bg-white shadow-sm scale-105' : 'text-indigo-300'}`}
              >
                <m.icon className="w-5 h-5 md:w-6 md:h-6"/> {m.label}
              </button>
            ))}
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#F8FAFC]">
            {mode === 'chat' ? (
                <>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 no-scrollbar" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <div className="text-6xl md:text-8xl mb-4">👋</div>
                                <h3 className="text-xl md:text-2xl font-black text-indigo-900">Chào {userProfile.name}!</h3>
                                <p className="text-indigo-400 font-bold text-sm md:text-base">Hãy chat để luyện tiếng Anh cùng mình nhé!</p>
                            </div>
                        )}
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-up group`}>
                                <div className={`max-w-[85%] md:max-w-[75%] relative`}>
                                    <div className={`px-4 py-3 md:px-6 md:py-4 shadow-sm border-2 ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none border-indigo-500' : 'bg-white text-indigo-950 rounded-[1.5rem] rounded-tl-none border-indigo-50'}`}>
                                        <p className="font-bold text-sm md:text-lg whitespace-pre-wrap">{m.text}</p>
                                        {m.translated && (
                                            <div className="mt-2 pt-2 border-t border-indigo-100/30 text-xs md:text-sm italic opacity-80 animate-fade-in">
                                                {m.translated}
                                            </div>
                                        )}
                                    </div>
                                    {m.role === 'model' && (
                                        <button 
                                            onClick={() => handleTranslateMessage(m.id)}
                                            className={`absolute -bottom-6 left-0 flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ${m.isTranslating ? 'animate-pulse' : ''}`}
                                        >
                                            <LanguageIcon className="w-3 h-3"/> Dịch tiếng Việt
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                             <div className="bg-white px-4 py-2 rounded-2xl border-2 border-indigo-50 animate-pulse text-indigo-300 font-bold text-xs">Đang nhắn...</div>
                          </div>
                        )}
                    </div>
                    <div className="p-4 md:p-6 bg-white border-t border-indigo-50 pb-safe">
                        <div className="flex gap-2 md:gap-4">
                            <input 
                              type="text" 
                              value={inputText} 
                              onChange={e => setInputText(e.target.value)} 
                              onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                              className="flex-1 clay-input px-4 md:px-6 py-3 md:py-4 font-bold text-sm md:text-lg outline-none" 
                              placeholder="Gửi tin nhắn cho bạn nhé..." 
                            />
                            <button onClick={handleSendMessage} className="p-3 md:p-4 clay-button clay-indigo text-white shadow-lg active:scale-90">
                              <PaperAirplaneIcon className="w-6 h-6 md:w-8 md:h-8"/>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full flex items-center justify-center mb-8 transition-all duration-500 bg-white shadow-xl ${isAiSpeaking ? 'ring-[20px] ring-indigo-100 scale-110' : ''}`}>
                        <span className={`text-7xl md:text-[120px] ${isAiSpeaking ? 'animate-bounce' : 'animate-float'}`}>{avatarEmoji}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-indigo-900 mb-2">{isLiveConnected ? (isAiSpeaking ? 'Đang nói...' : 'Đang nghe bé...') : 'Sẵn sàng kết nối!'}</h3>
                    <p className="text-indigo-400 font-bold text-xs md:text-sm mb-10 max-w-xs">Hãy sử dụng chế độ Chat để trò chuyện với bạn nhé!</p>
                    
                    <button onClick={() => setMode('chat')} className="px-10 py-4 md:px-12 md:py-5 clay-button clay-pink text-white font-black text-lg md:text-xl flex items-center gap-3">
                      <StopIcon className="w-6 h-6 md:w-8 md:h-8"/> Quay lại Chat
                    </button>
                </div>
            )}
        </div>
    </Wrapper>
  );
};

export default AIFriendModal;
