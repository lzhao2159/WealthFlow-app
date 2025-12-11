import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface AIAdvisorProps {
  state: AppState;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ state }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `你好，${state.user?.name || '使用者'}！我是您的智能財務顧問。我已經讀取了您的資產狀況，您可以問我任何關於理財、支出分析或投資建議的問題。` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const advice = await getFinancialAdvice(state, userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', content: advice }]);
    setLoading(false);
  };

  const suggestions = [
    "分析我本月的支出狀況",
    "我的投資組合風險高嗎？",
    "我該如何優化目前的儲蓄率？",
    "根據我的資產，給我一些投資建議"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">AI 智能顧問</h3>
          <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'ai' && (
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                 <Bot size={16} />
               </div>
             )}
             <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
               msg.role === 'user' 
                 ? 'bg-slate-900 text-white rounded-tr-none' 
                 : 'bg-slate-100 text-slate-800 rounded-tl-none'
             }`}>
               {msg.content}
             </div>
             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                 <User size={16} />
               </div>
             )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                 <Bot size={16} />
             </div>
             <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
             </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2 ml-2">試試問我：</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button 
                key={s}
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            placeholder="輸入您的理財問題..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
