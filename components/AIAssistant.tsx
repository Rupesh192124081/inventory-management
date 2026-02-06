
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Loader2, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, data }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Hello! I'm your Vyapar AI. I have full access to your inventory, sales, and party data. How can I help you optimize your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = JSON.stringify(data);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional business consultant for Vyapar Pro, a retail management app. 
        Analyze the following business data and answer the user's question concisely and accurately. 
        If specific metrics are asked (e.g., total sales, top customer), calculate them exactly from the data.
        
        DATA: ${context}
        
        USER QUESTION: ${userMessage}`,
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || "I'm sorry, I couldn't process that request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I encountered an error connecting to my brain. Please check your internet connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl"><Sparkles className="w-5 h-5 text-white" /></div>
          <div>
            <h3 className="font-black leading-tight">Business Advisor</h3>
            <p className="text-[10px] font-bold uppercase text-indigo-200">Real-time Intelligence</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-3" />
              <span className="text-xs font-bold text-slate-400">Analyzing your data...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask anything about your business..." 
            className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
