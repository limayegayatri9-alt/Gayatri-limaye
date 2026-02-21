import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Lock, 
  User, 
  Bot, 
  History, 
  Image as ImageIcon, 
  ShieldCheck, 
  Mail, 
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Code,
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { generateText, generateImage } from './services/gemini';
import { cn } from './lib/utils';
import { format } from 'date-fns';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image';
  timestamp: Date;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('rk_ai_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rk_ai_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password for demo: 'rkai'
    if (password === 'rkai' || password === '1234') {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid password. Try "rkai"');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: 'text',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (input.toLowerCase().startsWith('/image ') || input.toLowerCase().includes('generate image')) {
        if (!isPro) {
          throw new Error("Image generation is a Pro feature. Upgrade to RK AI Pro for 100rs/month.");
        }
        const prompt = input.replace(/^\/image\s+/i, '').replace(/generate image/i, '').trim();
        const imageUrl = await generateImage(prompt || "a futuristic assistant");
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: imageUrl,
          type: 'image',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const history = messages
          .filter(m => m.type === 'text')
          .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }));
        
        const response = await generateText(input, history);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: response || 'I am sorry, I could not generate a response.',
          type: 'text',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToGmail = () => {
    const historyText = messages.map(m => 
      `[${format(m.timestamp, 'yyyy-MM-dd HH:mm')}] ${m.role.toUpperCase()}: ${m.type === 'image' ? '[Image Generated]' : m.content}`
    ).join('\n\n');
    
    const mailtoUrl = `mailto:?subject=RK AI Chat History&body=${encodeURIComponent(historyText)}`;
    window.open(mailtoUrl);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-white">
        <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Bot className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">RK AI</h1>
            <p className="text-zinc-500 text-sm mt-2">Secure Personal Assistant</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Password Access</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (try 'rkai')"
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
            >
              Unlock Assistant <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4" /> Encrypted
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <User className="w-4 h-4" /> Personal
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">RK AI</span>
          {isPro && (
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
              Pro
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPro(!isPro)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              isPro ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isPro ? "Pro Active" : "Upgrade (₹100/mo)"}
          </button>
          <button 
            onClick={syncToGmail}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
            title="Sync to Gmail"
          >
            <Mail className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5">
              <Bot className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome to RK AI</h2>
              <p className="text-zinc-500 max-w-xs mx-auto">Your personal assistant for code, images, and daily tasks.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              <button 
                onClick={() => setInput("Write a clean Python function to sort a list.")}
                className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:bg-zinc-800 transition-all group"
              >
                <Code className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Write Code</div>
                <div className="text-xs text-zinc-500">Error-free pro coding</div>
              </button>
              <button 
                onClick={() => setInput("Generate an image of a futuristic city in the mountains.")}
                className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:bg-zinc-800 transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Create Art</div>
                <div className="text-xs text-zinc-500">Pro image generation</div>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex gap-4 max-w-[85%]",
              message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
              message.role === 'user' ? "bg-zinc-800" : "bg-emerald-500"
            )}>
              {message.role === 'user' ? <User className="w-5 h-5 text-zinc-400" /> : <Bot className="w-5 h-5 text-black" />}
            </div>
            <div className={cn(
              "space-y-1",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                  : "bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none"
              )}>
                {message.type === 'image' ? (
                  <div className="space-y-2">
                    <img 
                      src={message.content} 
                      alt="Generated" 
                      className="rounded-xl w-full max-w-sm border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <a 
                      href={message.content} 
                      download="rk-ai-image.png"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Download Image
                    </a>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-zinc-600 px-1">
                {format(message.timestamp, 'HH:mm')}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/50 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-black/50" />
            </div>
            <div className="bg-zinc-900 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          {error && !isLoading && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form 
            onSubmit={handleSend}
            className="relative flex items-center"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPro ? "Ask anything or /image..." : "Ask RK AI anything..."}
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex justify-between items-center px-2">
            <div className="flex gap-4">
              <button 
                onClick={() => setInput("/image ")}
                className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" /> Image Mode
              </button>
              <button 
                onClick={() => setMessages([])}
                className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <History className="w-3 h-3" /> Clear History
              </button>
            </div>
            <div className="text-[10px] text-zinc-600">
              RK AI v2.0 • Powered by Gemini
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
