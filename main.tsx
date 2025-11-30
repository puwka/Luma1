import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Code2, 
  LayoutTemplate, 
  ArrowRight, 
  Loader2, 
  Terminal,
  Smartphone,
  Cpu,
  Check,
  Github,
  Twitter,
  Menu,
  X,
  Play,
  CheckCircle2,
  MessageSquare,
  FileCode,
  Layers,
  Palette,
  Download,
  Monitor,
  Tablet,
  Undo,
  Redo,
  Eye,
  Mail,
  Lock,
  User,
  Image as ImageIcon,
  Send,
  Bot,
  History as HistoryIcon,
  Copy,
  Network,
  Box,
  Database,
  Globe,
  Server,
  Clock,
  Settings,
  Award,
  HelpCircle,
  ExternalLink,
  LogOut,
  Wind,
    Mic,
    StopCircle,
    Paperclip,
    Share2
  } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: string[]; // Base64 image data
  options?: string[];
  isMulti?: boolean;
  multiOptions?: string[];
}


/**
 * --- SYSTEM PROMPT ---
 */
const SYSTEM_PROMPT = `
Ты опытный Frontend разработчик и UI/UX дизайнер.
Твоя задача: генерировать или обновлять HTML код для Landing Page.

Правила:
1. Верни ТОЛЬКО валидный HTML код внутри тега <body>. НЕ возвращай теги <html>, <head> или markdown.
2. Используй Tailwind CSS для стилизации.
3. Если тебе передан существующий код, измени его согласно запросу пользователя, сохраняя общую структуру, если не просили иного.
4. Используй плейсхолдеры: https://placehold.co/600x400/1a1a1a/FFF
5. Делай дизайн современным, с отступами, крупной типографикой и темной темой по умолчанию (если не просили иную).
`;

// --- API CLIENT ---
const generateLanding = async (prompt: string, apiKey: string, currentCode?: string) => {
  if (!apiKey) throw new Error("API Key is required");
  
  let fullPrompt = prompt;
  if (currentCode) {
    fullPrompt = `
    У меня есть следующий HTML код:
    ${currentCode}
    
    Задача: ${prompt}
    
    Верни ПОЛНЫЙ обновленный HTML код.
    `;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = response.statusText || `Status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) { }
      throw new Error(`API Error: ${errorMessage}`);
    }

    const data = await response.json();
    let cleanHtml = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    cleanHtml = cleanHtml.replace(/```html/g, "").replace(/```/g, "").trim();
    
    return cleanHtml;
  } catch (error: any) {
    console.error("Generation failed:", error);
    throw new Error(error.message || "Unknown error occurred");
  }
};

// --- SHARED COMPONENTS ---

const Logo = () => (
  <div className="flex items-center gap-2 font-bold text-xl tracking-tighter select-none cursor-default">
    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
      <Sparkles size={16} fill="currentColor" />
    </div>
    <span className="text-white">Luma<span className="text-indigo-400">Builder</span></span>
  </div>
);

const Button = ({ children, variant = 'primary', className = '', onClick, disabled, type = 'button' }: any) => {
  const baseStyle = "px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    glow: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-white/10",
    outline: "bg-transparent border border-white/20 text-white hover:border-white/40 hover:bg-white/5"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

// --- MODAL COMPONENTS ---


const AuthModal = ({ isOpen, onClose, initialView = 'login', onSuccess }: { isOpen: boolean; onClose: () => void; initialView?: 'login' | 'register', onSuccess: () => void }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) setView(initialView);
    setError('');
  }, [isOpen, initialView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split('@')[0] }
          }
        });
        if (error) throw error;
        alert("Регистрация успешна! Проверьте почту для подтверждения (если включено) или просто войдите.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onSuccess();
    onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {view === 'login' ? 'Вход в Luma' : 'Создание аккаунта'}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === 'register' && (
                     <div>
                       <label className="block text-xs font-medium text-gray-400 mb-1.5">Имя</label>
                       <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                         <input 
                           type="text" 
                           value={name}
                           onChange={e => setName(e.target.value)}
                           placeholder="Ваше имя"
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                         />
                       </div>
                     </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 flex justify-between">
                      <span>Пароль</span>
                      {view === 'login' && <a href="#" className="text-indigo-400 hover:text-indigo-300">Забыли?</a>}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="glow" 
                    className="w-full justify-center mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (view === 'login' ? 'Войти' : 'Зарегистрироваться')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                   <div className="relative mb-6">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                     <div className="relative flex justify-center"><span className="bg-[#111] px-2 text-xs text-gray-500">или</span></div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <button className="flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors" onClick={handleGithubLogin}>
                       <Github size={16} /> Github
                     </button>
                     <button className="flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors" onClick={() => alert('В разработке')}>
                       <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><span className="text-[10px] font-bold text-black">G</span></div> Google
                     </button>
                   </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 text-center text-sm text-gray-400 border-t border-white/5">
                {view === 'login' ? (
                  <>Нет аккаунта? <button onClick={() => setView('register')} className="text-indigo-400 hover:text-indigo-300 font-medium">Регистрация</button></>
                ) : (
                  <>Уже есть аккаунт? <button onClick={() => setView('login')} className="text-indigo-400 hover:text-indigo-300 font-medium">Войти</button></>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const DownloadGuideModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCode className="text-indigo-500" size={24} />
                  Руководство по использованию
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-300 space-y-6">
                
                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
                    Запуск проекта
                  </h3>
                  <p className="pl-8 leading-relaxed text-gray-400">
                    Скачанный файл — это <b>.html</b> страница. Просто откройте её в любом современном браузере.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
                    Редактирование текста
                  </h3>
                  <div className="pl-8 space-y-2">
                    <p className="leading-relaxed text-gray-400">
                      Откройте файл в любом текстовом редакторе (VS Code, Блокнот). Найдите нужный текст и замените его.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-2">
                     <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs"><Palette size={12}/></span>
                     Стилизация (Tailwind CSS)
                  </h3>
                  <p className="pl-8 leading-relaxed text-gray-400">
                    Стили подключены через CDN. Изменяйте классы в атрибуте <code>class</code>.
                  </p>
                </div>

              </div>

              <div className="p-6 border-t border-white/5 bg-[#0a0a0a] shrink-0">
                <Button variant="glow" className="w-full" onClick={onConfirm}>
                  <Download size={18} className="mr-2" /> Скачать проект (.html)
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm">{message}</p>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition">
                  Отмена
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition">
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const PricingCard = ({ title, price, features, highlight = false, type, icon, onAction }: any) => (
  <div className={`relative p-8 rounded-3xl border flex flex-col h-full transition-transform hover:-translate-y-1 ${
    highlight 
      ? 'bg-[#111] border-indigo-500/50 shadow-2xl shadow-indigo-500/10' 
      : 'bg-white/5 border-white/10 hover:border-white/20'
  }`}>
    {highlight && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        Выгодно
      </div>
    )}
    <div className="mb-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-gray-400'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{price}</span>
        {type !== 'one-time' && type !== 'free' && <span className="text-gray-500 text-sm">/мес</span>}
        {type === 'one-time' && <span className="text-gray-500 text-sm"> разово</span>}
      </div>
    </div>
    
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
          <Check className={`w-5 h-5 shrink-0 ${highlight ? 'text-indigo-400' : 'text-gray-500'}`} />
          <span>{feat}</span>
        </li>
      ))}
    </ul>

    <Button variant={highlight ? 'glow' : 'secondary'} className="w-full" onClick={onAction}>
      {type === 'free' ? 'Начать бесплатно' : 'Купить'}
    </Button>
  </div>
);

const PricingSection = ({ onAuthReq }: { onAuthReq: () => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Честная система оплаты</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Мы разделили генерацию и скачивание. Экспериментируйте бесплатно каждый день, платите только за готовый результат.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Card 1: Free Daily */}
        <PricingCard 
          title="Старт"
          price="0₽"
          type="free"
          icon={<Zap size={24} />}
          onAction={onAuthReq}
          features={[
            "10 генераций в день (обновляется ежедневно)",
            "Доступ к редактору кода",
            "Мобильный предпросмотр",
            "Базовые шаблоны",
            "Скачивание недоступно"
          ]}
        />

        {/* Card 2: Single Download */}
        <PricingCard 
          title="1 Проект"
          price="100₽"
          type="one-time"
          icon={<FileCode size={24} />}
          onAction={onAuthReq}
          features={[
            "1 скачивание проекта (ZIP архив)",
            "Вечный срок действия",
            "Чистый HTML + Tailwind код",
            "Без водяных знаков",
            "Полные права на код"
          ]}
        />

        {/* Card 3: Download Pack (Highlighted) */}
        <PricingCard 
          title="Пакет (5 шт)"
          price="490₽"
          type="one-time"
          highlight={true}
          icon={<Layers size={24} />}
          onAction={onAuthReq}
          features={[
            "5 скачиваний проекта",
            "Экономия 10₽ с каждого проекта",
            "Вечный срок действия кредитов",
            "Коммерческая лицензия",
            "Удаление водяных знаков"
          ]}
        />
      </div>
    </div>
  );
};

// --- ANIMATION & LANDING COMPONENTS ---

const CodeGenerationDemo = () => {
  const [text, setText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const codeSnippet = `export default function Hero() {
  return (
    <div className="bg-slate-900 h-full flex 
    items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="inline-block p-2 
        bg-indigo-500/20 rounded-lg 
        text-indigo-400 mb-2">
          New Release v2.0
        </div>
        <h1 className="text-4xl md:text-6xl 
        font-bold bg-clip-text text-transparent 
        bg-gradient-to-r from-indigo-400 
        to-cyan-400">
          Future is here
        </h1>
        <p className="text-gray-400 text-lg 
        max-w-md mx-auto">
          Built with Luma AI speed.
        </p>
        <button className="px-8 py-3 
        bg-indigo-600 rounded-full text-white 
        hover:bg-indigo-500 transition 
        shadow-lg shadow-indigo-500/25">
          Get Started
        </button>
      </div>
    </div>
  );
}`;

  useEffect(() => {
    let currentIndex = 0;
    let isTyping = true;
    
    const interval = setInterval(() => {
      if (isTyping) {
        if (currentIndex <= codeSnippet.length) {
          setText(codeSnippet.slice(0, currentIndex));
          currentIndex++;
          if (currentIndex > codeSnippet.length * 0.3) setShowPreview(true);
        } else {
          isTyping = false;
          setTimeout(() => {
            setText('');
            currentIndex = 0;
            setShowPreview(false);
            isTyping = true;
          }, 4000);
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[400px] w-full">
      {/* Code Editor Side */}
      <div className="w-full md:w-1/2 bg-[#0F0F0F] p-4 md:p-6 font-mono text-xs md:text-sm text-gray-300 overflow-hidden border-b md:border-b-0 md:border-r border-white/5 relative text-left">
        <div className="absolute top-2 right-2 text-xs text-gray-600">App.tsx</div>
        <pre className="whitespace-pre-wrap leading-relaxed">
          <span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;
          <br /><br />
          {text}
          <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse align-middle ml-1"/>
        </pre>
      </div>

      {/* Live Preview Side */}
      <div className="w-full md:w-1/2 bg-[#050505] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <AnimatePresence>
          {showPreview ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <div className="bg-slate-900 h-full w-full flex items-center justify-center p-8 relative text-left">
                <div className="absolute inset-0 bg-indigo-500/5" />
                <div className="text-center space-y-6 relative z-10">
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="inline-block p-2 bg-indigo-500/20 rounded-lg text-indigo-400 text-xs md:text-sm mb-2"
                   >
                     New Release v2.0
                   </motion.div>
                   <motion.h1 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400"
                   >
                     Future is here
                   </motion.h1>
                   <motion.p 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="text-gray-400 text-sm md:text-base max-w-md mx-auto"
                   >
                     Built with Luma AI speed.
                   </motion.p>
                   <motion.button 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     whileHover={{ scale: 1.05 }}
                     transition={{ delay: 0.5 }}
                     className="px-6 py-2 bg-indigo-600 rounded-full text-white text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
                   >
                     Get Started
                   </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-gray-600">
               <Loader2 className="animate-spin mb-2" />
               <span className="text-xs font-mono">Waiting for code...</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, className = '' }: any) => (
  <div className={`p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors ${className} text-left`}>
    <div className="mb-4 bg-white/5 w-fit p-3 rounded-xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      icon: <MessageSquare size={20} />,
      title: "Опишите идею",
      desc: "Просто расскажите, что вам нужно. Например: 'Портфолио для фотографа в темном стиле'.",
      visual: (
        <div className="relative w-full h-full flex flex-col justify-center items-center p-6 text-left">
           <div className="w-full max-w-xs bg-[#1A1A1A] border border-white/10 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400">U</div>
                 <div className="h-2 bg-white/10 rounded w-12" />
              </div>
              <div className="text-sm text-gray-300 font-mono typing-effect-fast">
                Сгенерируй лендинг для<br />SaaS платформы...
              </div>
           </div>
           <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="absolute bottom-10 right-10 bg-indigo-600 text-white p-2 rounded-full shadow-lg shadow-indigo-500/50"
           >
             <ArrowRight size={16} />
           </motion.div>
        </div>
      )
    },
    {
      id: 1,
      icon: <Cpu size={20} />,
      title: "AI Анализ",
      desc: "Luma анализирует структуру, подбирает Tailwind-классы и оптимизирует UX.",
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#050505] text-left">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 opacity-10 pointer-events-none">
            {Array.from({ length: 36 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: Math.random() * 2 + 2, repeat: Infinity }}
                className="bg-indigo-500 rounded-xs"
              />
            ))}
          </div>
          
          <div className="relative z-10 bg-[#0F0F0F] border border-white/10 p-5 rounded-xl shadow-2xl flex flex-col gap-4 w-72">
            <div className="flex justify-between w-full text-[10px] text-gray-400 font-mono uppercase tracking-widest border-b border-white/5 pb-2">
               <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>Processing</span>
               <span className="text-indigo-400">Luma 1.5</span>
            </div>
            
            <div className="space-y-3">
               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-gray-400 font-mono"><span>Structure</span><span>100%</span></div>
                 <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-indigo-500" />
                 </div>
               </div>
               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-gray-400 font-mono"><span>Color Palette</span><span>Generating...</span></div>
                 <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 2, delay: 0.2 }} className="h-full bg-purple-500" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: <Download size={20} />,
      title: "Готовый результат",
      desc: "Получите исходный код и превью сайта. Скачайте архив с проектом одним нажатием.",
      visual: (
         <div className="relative w-full h-full flex items-center justify-center bg-[#050505] p-6 overflow-hidden text-left">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />

            <div className="relative z-10 w-full max-w-sm bg-[#111] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden group">
              <div className="bg-[#1a1a1a] p-2 border-b border-white/5 flex justify-between items-center">
                 <div className="flex gap-1.5 ml-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/20"/>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/20"/>
                    <div className="w-2 h-2 rounded-full bg-green-500/20"/>
                 </div>
                 <div className="flex gap-2 text-[9px] font-mono text-gray-500 bg-black/30 px-2 py-0.5 rounded-full">
                    <span>index.html</span>
                    <span className="text-gray-700">|</span>
                    <span className="text-indigo-400">Preview</span>
                 </div>
                 <div className="w-4" />
              </div>
              
              <div className="flex flex-1 h-36">
                 <div className="w-1/2 bg-[#0F0F0F] p-3 font-mono text-[7px] leading-relaxed text-gray-500 border-r border-white/5 relative overflow-hidden">
                    <div className="text-purple-400">export default</div>
                    <div><span className="text-blue-400">function</span> <span className="text-yellow-200">App</span>() {'{'}</div>
                    <div className="pl-2"><span className="text-pink-400">return</span> (</div>
                    <div className="pl-3">&lt;<span className="text-blue-300">div</span> <span className="text-green-400">class</span>=</div>
                    <div className="pl-4 text-orange-300">"flex col"</div>
                    <div className="pl-3">&gt;...&lt;/<span className="text-blue-300">div</span>&gt;</div>
                 </div>

                 <div className="w-1/2 bg-slate-900 p-3 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 bg-indigo-500/5" />
                    <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ duration: 0.5, delay: 0.2 }}
                       className="w-full space-y-2 text-center"
                    >
                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 mx-auto flex items-center justify-center">
                          <Zap size={12} className="text-indigo-400" />
                       </div>
                       <div className="h-2 bg-white/20 rounded w-3/4 mx-auto"/>
                       <div className="h-1.5 bg-white/10 rounded w-1/2 mx-auto"/>
                       <div className="mt-2 px-3 py-1 bg-indigo-600 rounded-full text-[6px] text-white w-fit mx-auto shadow-lg shadow-indigo-500/30">
                          Button
                       </div>
                    </motion.div>
                 </div>
              </div>

              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                className="absolute inset-x-0 bottom-4 flex justify-center z-20"
              >
                 <div className="bg-green-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-green-500/20 cursor-pointer hover:scale-105 transition-transform">
                    <Download size={12} strokeWidth={3} />
                    <span>Скачано: project.zip</span>
                 </div>
              </motion.div>
            </div>
         </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="space-y-4 text-left">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id}
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
              activeStep === index 
                ? "bg-white/10 border-white/10 shadow-lg" 
                : "bg-transparent border-transparent hover:bg-white/5"
            }`}
            onClick={() => setActiveStep(index)}
          >
            {activeStep === index && (
               <motion.div 
                 layoutId="activeGlow"
                 className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xl -z-10" 
               />
            )}
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-lg transition-colors duration-300 ${activeStep === index ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                 {step.icon}
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-1 transition-colors ${activeStep === index ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed transition-colors ${activeStep === index ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
            {activeStep === index && (
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 4.5, ease: "linear" }}
                 className="absolute bottom-0 left-0 h-[2px] bg-indigo-500/50 rounded-b-2xl"
               />
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative h-[400px] bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-10 pointer-events-none" />
         <AnimatePresence mode="wait">
            <motion.div
               key={activeStep}
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 1.05, y: -20 }}
               transition={{ duration: 0.4 }}
               className="w-full h-full"
            >
               {steps[activeStep].visual}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
};

// --- LANDING PAGE ---

const LandingPage = ({ onStartBuilder }: { onStartBuilder: (view?: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login'|'register'>('login');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = (view: 'login' | 'register') => {
    setAuthView(view);
    setAuthModalOpen(true);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full h-full bg-[#050505] text-white selection:bg-indigo-500/30 overflow-y-auto relative">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Возможности</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">Как это работает</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Цены</a>
            {user ? (
                <div className="flex items-center gap-4">
                    <button onClick={() => onStartBuilder('profile')} className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                            {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{user.user_metadata?.name || user.email}</span>
                    </button>
                    <Button variant="glow" className="px-4 py-1.5 text-sm" onClick={() => onStartBuilder('generator')}>В редактор</Button>
                </div>
            ) : (
                <>
            <Button variant="secondary" className="px-4 py-1.5 text-sm" onClick={() => openAuth('login')}>
              Войти
            </Button>
            <Button variant="glow" className="px-4 py-1.5 text-sm" onClick={() => openAuth('register')}>
              Попробовать бесплатно
            </Button>
                </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence>{isMenuOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-[#0A0A0A] border-b border-white/10 overflow-hidden"><div className="p-6 flex flex-col gap-4"><a href="#features" className="text-gray-400">Возможности</a><a href="#how-it-works" className="text-gray-400">Как это работает</a><a href="#pricing" className="text-gray-400">Цены</a><Button variant="secondary" className="w-full" onClick={() => openAuth('login')}>Войти</Button><Button variant="glow" className="w-full" onClick={() => openAuth('register')}>Регистрация</Button></div></motion.div>)}</AnimatePresence>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialView={authView} onSuccess={onStartBuilder} />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <section className="max-w-7xl mx-auto text-center mb-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-8 font-mono"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>v2.5 уже доступна: IDE + Preview</div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">Веб-разработка <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">на скорости мысли</span></h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">Превратите текстовое описание в полноценный, адаптивный сайт за секунды. Используйте мощь Luma AI для создания чистого кода.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4"><Button variant="primary" className="h-12 px-8 text-lg w-full sm:w-auto" onClick={() => onStartBuilder('generator')}><Zap className="w-5 h-5 fill-black" />Сгенерировать сайт</Button><Button variant="secondary" className="h-12 px-8 text-lg w-full sm:w-auto"><Play className="w-4 h-4 mr-2" fill="currentColor" />Смотреть демо</Button></div>
          </motion.div>
        </section>

        <section className="max-w-5xl mx-auto mb-32 relative">
           <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full opacity-30" />
           <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden">
             <div className="h-8 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2 justify-between"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/20" /><div className="w-3 h-3 rounded-full bg-yellow-500/20" /><div className="w-3 h-3 rounded-full bg-green-500/20" /></div><div className="text-[10px] text-gray-500 font-mono flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />luma-preview.app</div><div className="w-10" /></div>
             <CodeGenerationDemo />
           </motion.div>
        </section>

        <section id="features" className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16"><h2 className="text-3xl md:text-5xl font-bold mb-4">Больше, чем просто генератор</h2><p className="text-gray-400">Полный набор инструментов для профессиональной верстки.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={<Zap className="text-yellow-400" />} title="Мгновенная генерация" desc="От промпта до готового кода менее чем за 10 секунд." className="md:col-span-2" />
            <FeatureCard icon={<Smartphone className="text-blue-400" />} title="Mobile First" desc="Адаптивный дизайн по умолчанию." />
            <FeatureCard icon={<Code2 className="text-green-400" />} title="Чистый код" desc="Семантический HTML5 и Tailwind CSS." />
            <FeatureCard icon={<LayoutTemplate className="text-purple-400" />} title="Готовые секции" desc="Герои, формы, отзывы, футеры — AI знает структуру." className="md:col-span-2" />
          </div>
        </section>

        <section id="how-it-works" className="max-w-7xl mx-auto mb-32 border-t border-white/5 pt-32">
          <div className="mb-16 text-center"><h2 className="text-3xl md:text-5xl font-bold mb-6">Как это работает?</h2><p className="text-gray-400 text-lg">Простой процесс: от вашей идеи до готового продукта за 3 шага.</p></div>
          <HowItWorksSection />
        </section>

        <section id="pricing" className="max-w-7xl mx-auto mb-32 border-t border-white/5 pt-32">
           <PricingSection onAuthReq={() => openAuth('register')} />
        </section>

        <footer className="border-t border-white/10 pt-16 pb-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
            <div className="col-span-2 md:col-span-1"><Logo /><p className="mt-4 text-gray-500 text-sm">Создавайте будущее веба вместе с нами.</p></div>
            <div><h4 className="font-bold mb-4">Продукт</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Возможности</a></li><li><a href="#" className="hover:text-white">Интеграции</a></li></ul></div>
            <div><h4 className="font-bold mb-4">Компания</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">О нас</a></li><li><a href="#" className="hover:text-white">Блог</a></li></ul></div>
            <div><h4 className="font-bold mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Privacy</a></li><li><a href="#" className="hover:text-white">Terms</a></li></ul></div>
          </div>
          <div className="text-center text-gray-600 text-sm max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p>© 2024 LumaBuilder AI. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0"><Github size={20} className="hover:text-white cursor-pointer transition" /><Twitter size={20} className="hover:text-white cursor-pointer transition" /></div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// --- GENERATOR COMPONENTS ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: string[];
  options?: string[]; // For single select
  multiOptions?: string[]; // For multi select
  isMulti?: boolean;
}

const STYLES = ["Минимализм", "Темный", "Светлый", "Корпоративный", "Креативный"];
const SECTIONS = ["Hero (Главный)", "О нас", "Услуги", "Цены", "Отзывы", "Контакты", "Footer"];

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  onOptionClick,
  onMultiOptionSubmit,
  isLoading,
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat
}: { 
  messages: Message[], 
  onSendMessage: (msg: string, images?: string[]) => void,
  onOptionClick: (opt: string) => void,
  onMultiOptionSubmit: (opts: string[]) => void,
  isLoading: boolean,
  chats: any[],
  currentChatId: string | null,
  onNewChat: () => void,
  onSelectChat: (id: string) => void,
  onDeleteChat: (id: string, e: React.MouseEvent) => void
}) => {
  const [input, setInput] = useState('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages, selectedImages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);
  
  const handleSubmit = (e?: React.FormEvent) => { 
      if (e) e.preventDefault(); 
      if ((!input.trim() && selectedImages.length === 0) || isLoading) return; 
      onSendMessage(input, selectedImages.length > 0 ? selectedImages : undefined); 
      setInput(''); 
      setSelectedImages([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleMulti = (opt: string) => {
    setSelectedMulti(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
          if (selectedImages.length + files.length > 3) {
              alert("Максимум 3 изображения");
              return;
          }
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onload = (e) => setSelectedImages(prev => [...prev, e.target?.result as string]);
              reader.readAsDataURL(file);
          });
      }
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Chat List / Header Switcher - Hidden as it is in Sidebar now */}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
        {messages.length === 0 && (
           <div className="text-center py-10 opacity-50">
             <Bot className="w-12 h-12 mx-auto mb-4 text-indigo-500"/>
             <p className="text-sm text-gray-400">Привет! Опишите сайт, который хотите создать.<br/>Я задам пару вопросов, чтобы результат был идеальным.</p>
           </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             {msg.images && msg.images.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-2 max-w-[80%] justify-end">
                     {msg.images.map((img, i) => (
                         <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                             <img src={img} alt="User upload" className="rounded-xl border border-white/10 max-h-32 object-cover" />
                         </motion.div>
                     ))}
                 </div>
             )}
             {/* Backward compatibility for single image */}
             {!msg.images && (msg as any).image && (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-2 max-w-[80%]">
                     <img src={(msg as any).image} alt="User upload" className="rounded-xl border border-white/10 max-h-48 object-cover" />
                 </motion.div>
             )}
             
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[90%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}`}>
                {msg.text}
             </motion.div>
             
             {msg.options && (
               <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                 {msg.options.map(opt => (
                   <button key={opt} onClick={() => onOptionClick(opt)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-indigo-300 transition-colors">{opt}</button>
                 ))}
               </div>
             )}

             {msg.isMulti && msg.multiOptions && (
                <div className="mt-2 max-w-[90%] space-y-2">
                   <div className="flex flex-wrap gap-2">
                      {msg.multiOptions.map(opt => (
                        <button 
                          key={opt} 
                          onClick={() => toggleMulti(opt)} 
                          className={`px-3 py-1.5 border rounded-lg text-xs transition-all flex items-center gap-1 ${selectedMulti.includes(opt) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                          {selectedMulti.includes(opt) && <Check size={10}/>} {opt}
                        </button>
                      ))}
                   </div>
                   <button 
                     onClick={() => { onMultiOptionSubmit(selectedMulti); setSelectedMulti([]); }}
                     disabled={selectedMulti.length === 0}
                     className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                   >
                     Готово ({selectedMulti.length})
                   </button>
                </div>
             )}
          </div>
        ))}
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/></div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
        {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
                {selectedImages.map((img, i) => (
                    <div key={i} className="relative group shrink-0">
                        <img src={img} alt="Selected" className="h-16 w-16 rounded-lg border border-white/20 object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-all"><X size={12}/></button>
                    </div>
                ))}
            </div>
        )}
        
        <div className="relative flex items-end gap-2 bg-[#151515] border border-white/10 rounded-3xl p-1.5 pl-4 transition-all focus-within:border-indigo-500/50">
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageSelect} 
             accept="image/*"
             multiple
             className="hidden" 
          />
          
          <button 
             type="button"
             onClick={() => fileInputRef.current?.click()}
             className="p-2 text-gray-400 hover:text-white transition-colors mb-0.5"
             title="Добавить изображения (макс 3)"
             disabled={selectedImages.length >= 3}
          >
             <Paperclip size={20} />
          </button>
          
          <textarea 
            ref={textareaRef}
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..." 
            rows={1}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none resize-none py-3 px-2 custom-scrollbar max-h-[150px]"
            style={{ minHeight: '44px' }}
          />
          
          <button 
            onClick={() => handleSubmit()} 
            disabled={isLoading || (!input.trim() && selectedImages.length === 0)} 
            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0 mb-0.5"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatHistoryList = ({ chats, currentChatId, onSelect, onDelete }: any) => (
    <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {chats.length === 0 && <div className="text-center text-gray-500 text-xs py-4">История чатов пуста</div>}
        {chats.map((chat: any) => (
            <div key={chat.id} onClick={() => onSelect(chat.id)} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={14} />
                    <span className="text-xs truncate">{chat.title || 'Новый чат'}</span>
                </div>
                <button onClick={(e) => onDelete(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all">
                    <X size={12} />
                </button>
            </div>
        ))}
    </div>
);

const VersionsList = ({ history, currentIndex, onSelect }: { history: string[], currentIndex: number, onSelect: (idx: number) => void }) => (
  <div className="p-4 space-y-2">
    {history.length === 0 && (<div className="text-center text-gray-500 text-sm py-8">История версий пуста</div>)}
    {history.map((_, idx) => (
      <button key={idx} onClick={() => onSelect(idx)} className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${idx === currentIndex ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
        <span className="font-medium">Версия {idx + 1}</span>{idx === currentIndex && <CheckCircle2 size={14} />}
      </button>
    ))}
  </div>
);

// --- NEW WORKFLOW COMPONENT ---

const SiteArchitectureView = ({ code }: { code: string | null }) => {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!code) return;
    
    const analyze = () => {
        const imgCount = (code.match(/<img/g) || []).length;
        const imgWithAlt = (code.match(/<img[^>]+alt=["'][^"']+["']/g) || []).length;
        const domNodes = (code.match(/<[a-z]+/g) || []).length;
        
        const colors = [];
        if (code.includes('indigo')) colors.push({ name: 'Indigo', hex: 'bg-indigo-500' });
        if (code.includes('blue')) colors.push({ name: 'Blue', hex: 'bg-blue-500' });
        if (code.includes('purple')) colors.push({ name: 'Purple', hex: 'bg-purple-500' });
        if (code.includes('gray') || code.includes('zinc')) colors.push({ name: 'Gray', hex: 'bg-gray-500' });
        if (code.includes('red')) colors.push({ name: 'Red', hex: 'bg-red-500' });
        if (code.includes('green') || code.includes('emerald')) colors.push({ name: 'Emerald', hex: 'bg-emerald-500' });
        if (code.includes('yellow')) colors.push({ name: 'Yellow', hex: 'bg-yellow-500' });
        if (code.includes('bg-white') || code.includes('bg-[#ffffff]')) colors.push({ name: 'White', hex: 'bg-white' });
        if (code.includes('bg-black') || code.includes('bg-[#000000]')) colors.push({ name: 'Black', hex: 'bg-black' });

        const structure = [];
        if (code.includes('<header')) structure.push({ name: 'Header', type: 'nav' });
        if (code.includes('<hero') || code.includes('Hero')) structure.push({ name: 'Hero Section', type: 'section' });
        const sections = (code.match(/<section/g) || []).length;
        for(let i=0; i<sections; i++) structure.push({ name: `Section ${i+1}`, type: 'section' });
        if (code.includes('<footer')) structure.push({ name: 'Footer', type: 'nav' });

        return {
            score: Math.min(100, 85 + (code.includes('<h1') ? 5 : 0) + (imgWithAlt === imgCount ? 5 : 0) + (domNodes < 500 ? 5 : 0)),
            seo: { hasH1: code.includes('<h1'), imgRatio: imgCount > 0 ? Math.round((imgWithAlt/imgCount)*100) : 100, domSize: domNodes },
            colors: [...new Set(colors.map(c => JSON.stringify(c)))].map(s => JSON.parse(s)).slice(0, 5),
            structure,
            tech: {
                tailwind: true,
                framer: code.includes('motion.') || code.includes('animate='),
                react: true,
                lucide: code.includes('lucide-react')
            }
        };
    };
    
    setAnalysis(analyze());
  }, [code]);

  if (!analysis) return <div className="flex items-center justify-center h-full text-gray-500">Анализ кода...</div>;

  return (
    <div className="w-full h-full bg-[#0A0A0A] relative overflow-hidden p-8 font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto h-full flex flex-col gap-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151515] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> Performance</div>
                <div className="text-3xl font-bold text-white">{analysis.score} <span className="text-sm font-normal text-gray-500">/ 100</span></div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{ width: `${analysis.score}%` }} /></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#151515] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2"><Globe size={14} className="text-blue-500"/> SEO Score</div>
                <div className="text-3xl font-bold text-white">{analysis.seo.hasH1 ? 'A' : 'B-'} <span className="text-sm font-normal text-gray-500">Grade</span></div>
                <div className="flex gap-1 text-[10px] text-gray-500">
                    <span className={analysis.seo.hasH1 ? 'text-green-400' : 'text-red-400'}>{analysis.seo.hasH1 ? '✓ H1 Tag' : '✕ Missing H1'}</span>
                    <span>•</span>
                    <span>{analysis.seo.imgRatio}% Alt Text</span>
           </div>
        </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#151515] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2"><Code2 size={14} className="text-purple-500"/> DOM Nodes</div>
                <div className="text-3xl font-bold text-white">{analysis.seo.domSize}</div>
                <div className="text-[10px] text-gray-500">Элементов на странице</div>
              </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#151515] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2"><Palette size={14} className="text-pink-500"/> Palette</div>
                <div className="flex -space-x-2 pt-1">
                    {analysis.colors.map((c: any, i: number) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#151515] ${c.hex}`} title={c.name} />
                    ))}
                    {analysis.colors.length === 0 && <span className="text-xs text-gray-500">No colors detected</span>}
                 </div>
              </motion.div>
           </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden">
            {/* Structure Tree */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><LayoutTemplate size={16}/> Page Structure</h3>
                <div className="space-y-3 relative flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-white/10" />
                    {analysis.structure.map((node: any, i: number) => (
                        <div key={i} className="relative pl-8 flex items-center gap-3">
                            <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-[#151515]" />
                            <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg w-full text-xs text-gray-300 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
                                <span>{node.name}</span>
                                <span className="text-[10px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">&lt;{node.type}&gt;</span>
                 </div>
                    </div>
                    ))}
                    {analysis.structure.length === 0 && <div className="text-center text-gray-500 text-xs py-10">Структура не определена</div>}
                    </div>
            </motion.div>

            {/* Tech Stack Radar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Cpu size={16}/> Tech Stack</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-sky-500/20 flex items-center justify-center"><Wind size={16} className="text-sky-400"/></div>
                            <div>
                                <div className="text-xs font-bold text-white">Tailwind CSS</div>
                                <div className="text-[10px] text-gray-500">Styling Engine</div>
                    </div>
                 </div>
                        <div className="text-xs font-mono text-green-400">Active</div>
           </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center"><Code2 size={16} className="text-blue-400"/></div>
                            <div>
                                <div className="text-xs font-bold text-white">React</div>
                                <div className="text-[10px] text-gray-500">UI Library</div>
                 </div>
                 </div>
                        <div className="text-xs font-mono text-green-400">v18.2</div>
           </div>
                    <div className={`flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 transition-opacity ${analysis.tech.framer ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center"><Play size={16} className="text-purple-400"/></div>
                            <div>
                                <div className="text-xs font-bold text-white">Framer Motion</div>
                                <div className="text-[10px] text-gray-500">Animations</div>
        </div>
                        </div>
                        <div className="text-xs font-mono text-gray-400">{analysis.tech.framer ? 'Used' : 'Not used'}</div>
                    </div>
                </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Sparkles size={16} className="text-indigo-400"/> AI Insights</h3>
                <div className="space-y-3">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-xs text-indigo-200 leading-relaxed">
                            Структура кода выглядит чистой. Использование семантических тегов (Header, Footer) улучшает доступность.
                        </p>
        </div>
                    {analysis.seo.hasH1 ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-2 items-start">
                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5"/>
                            <p className="text-xs text-green-200">SEO отлично: Заголовок H1 присутствует.</p>
                        </div>
                    ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 items-start">
                            <X size={14} className="text-red-400 shrink-0 mt-0.5"/>
                            <p className="text-xs text-red-200">SEO совет: Добавьте тег &lt;h1&gt; для лучшего ранжирования.</p>
                        </div>
                    )}
                    {analysis.seo.domSize > 800 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-2 items-start">
                            <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5"/>
                            <p className="text-xs text-yellow-200">Производительность: DOM дерево довольно большое, подумайте о виртуализации.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- GENERATOR PAGE ---


import { supabase } from './supabaseClient';

// --- PUBLISH MODAL ---

const PublishModal = ({ isOpen, onClose, onPublish, code }: { isOpen: boolean, onClose: () => void, onPublish: (data: any) => Promise<any>, code: string }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const result = await onPublish({ title, description });
        // @ts-ignore
        if (result && result.id) {
            const url = `${window.location.origin}?site_id=${result.id}`;
            setPublishedUrl(url);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (publishedUrl) {
        navigator.clipboard.writeText(publishedUrl);
        // Optional: Show toast/tooltip instead of alert
    }
  };

  const handleShare = async () => {
    if (publishedUrl) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'My Luma Website',
            text: description || 'Check out this website I built with Luma AI!',
            url: publishedUrl,
          });
        } catch (error) {
          console.log('Error sharing', error);
        }
      } else {
        copyToClipboard();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{publishedUrl ? 'Готово!' : 'Опубликовать сайт'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>
        
        {!publishedUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Название проекта</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" placeholder="Мой крутой лендинг" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Описание</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none h-24 resize-none" placeholder="Краткое описание сайта..." />
            </div>
            
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition font-medium">Отмена</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Globe size={18} /> Опубликовать</>}
                </button>
            </div>
            </form>
        ) : (
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-500 mb-2 border border-indigo-500/20">
                        <Globe size={32} />
                    </div>
                    <p className="text-sm text-gray-400 text-center max-w-xs">Ваш сайт опубликован и доступен всем по ссылке</p>
                </div>
                
                <div className="relative group">
                    <input readOnly value={publishedUrl} className="w-full bg-[#050505] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-300 focus:outline-none group-hover:border-white/20 transition-colors" />
                    <button onClick={() => copyToClipboard()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition" title="Копировать">
                        <Copy size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <a href={publishedUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition text-sm border border-white/5 hover:border-white/10">
                        <ExternalLink size={16} /> Открыть
                    </a>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                        <Share2 size={16} /> Поделиться
                    </button>
                </div>
            </div>
        )}
      </motion.div>
    </div>
  );
};

const GeneratorPage = ({ onGoHome }: { onGoHome: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<'idle' | 'ask_style' | 'ask_sections' | 'ready'>('idle');
  const [activeTab, setActiveTab] = useState<'chat' | 'chats_list' | 'history'>('chat');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  
  const handlePublish = async ({ title, description }: { title: string, description: string }) => {
      if (!user || !currentCode) return;
      
      const { data, error } = await supabase.from('projects').insert({
          user_id: user.id,
          chat_id: currentChatId,
          code: currentCode,
          prompt: description, // Using description as prompt or title
          title: title,
          description: description,
          is_public: true,
          likes: 0
      }).select().single();

      if (error) {
          console.error(error);
          alert(`Ошибка публикации: ${error.message || error.details || JSON.stringify(error)}`);
          throw error;
      } 
      
      return data;
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showDownloadGuide, setShowDownloadGuide] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'workflow'>('preview');
  const [generationsLeft, setGenerationsLeft] = useState(10);
  const [downloadsLeft, setDownloadsLeft] = useState(0);
  const [user, setUser] = useState<any>(null);
  
  // Chat Management
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
            setGenerationsLeft(data.generations_left);
            setDownloadsLeft(data.downloads_left);
        }
    };

    const loadChats = async () => {
        const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: false });
        if (data) setChats(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            setUser(session.user);
            fetchProfile(session.user.id);
            loadChats();
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            setUser(session.user);
            fetchProfile(session.user.id);
            loadChats();
        } else {
            setUser(null);
            setChats([]);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createNewChat = async () => {
      if (!user) {
          setMessages([]);
          setChatState('idle');
          setCurrentChatId(null);
          return;
      }
      
      const { data, error } = await supabase.from('chats').insert({ user_id: user.id, title: 'Новый сайт' }).select().single();
      if (data) {
          setChats([data, ...chats]);
          setCurrentChatId(data.id);
          setMessages([]);
          setChatState('idle');
          setHistory([]);
          setHistoryIndex(-1);
      }
  };

  const selectChat = async (id: string) => {
      setCurrentChatId(id);
      const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', id).order('created_at', { ascending: true });
      if (data) {
          setMessages(data.map(m => ({ id: m.id, role: m.role, text: m.content })));
          if (data.length > 0) setChatState('ready');
          else setChatState('idle');
      }

      if (user) {
         const { data: projects } = await supabase.from('projects').select('*').eq('chat_id', id).order('created_at', { ascending: true });
         if (projects && projects.length > 0) {
            setHistory(projects.map(p => p.code));
            setHistoryIndex(projects.length - 1);
         } else {
            setHistory([]);
            setHistoryIndex(-1);
         }
      }
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setChatToDelete(id);
      setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
      if (!chatToDelete) return;
      const id = chatToDelete;
      await supabase.from('chats').delete().eq('id', id);
      setChats(chats.filter(c => c.id !== id));
      if (currentChatId === id) {
          setCurrentChatId(null);
          setMessages([]);
          setChatState('idle');
          setHistory([]);
          setHistoryIndex(-1);
      }
      setShowDeleteConfirm(false);
      setChatToDelete(null);
  };

  const currentCode = historyIndex >= 0 ? history[historyIndex] : null;

  const handleUserResponse = async (text: string, images?: string[]) => {
     const newUserMsg: Message = { 
         id: Date.now().toString(), 
         role: 'user', 
         text: text || (images && images.length > 0 ? `${images.length} изображения загружено` : ''),
         images 
     };
     setMessages(prev => [...prev, newUserMsg]);
     
     // Save User Message
     if (user) {
         let chatId = currentChatId;
         if (!chatId) {
             const title = text ? text.slice(0, 30) : 'Новый чат (Media)';
             const { data } = await supabase.from('chats').insert({ user_id: user.id, title }).select().single();
             if (data) {
                 chatId = data.id;
                 setCurrentChatId(chatId);
                 setChats([data, ...chats]);
             }
         }
         if (chatId) {
             // Note: We are not saving base64 image to DB here to avoid storage limits. 
             // In production, upload to storage bucket and save URL.
             await supabase.from('chat_messages').insert({ chat_id: chatId, role: 'user', content: newUserMsg.text });
         }
     }

     processNextStep(text || "Проанализируй изображения и сделай сайт на их основе");
  };

  const processNextStep = (userText: string) => {
    setIsGenerating(true);
    setTimeout(async () => {
      let nextMsg: Message = { id: Date.now().toString(), role: 'assistant', text: '' };
      let nextState = chatState;
      const lowerText = userText.toLowerCase();

      // ... Logic state machine ...
      if (chatState === 'idle') {
          const hasStyle = STYLES.some(s => lowerText.includes(s.toLowerCase()));
          const hasSections = SECTIONS.some(s => lowerText.includes(s.toLowerCase()));
          
          if (hasStyle && hasSections) {
             nextMsg.text = "Отлично! Всё понятно. Генерирую ваш сайт...";
             nextState = 'ready';
          } else if (!hasStyle) {
             nextMsg.text = "Понял идею. Какой стиль вы предпочитаете?";
             nextMsg.options = STYLES;
             nextState = 'ask_style';
          } else {
             nextMsg.text = "Хорошо. Какие разделы добавить?";
             nextMsg.isMulti = true;
             nextMsg.multiOptions = SECTIONS;
             nextState = 'ask_sections';
          }
      } else if (chatState === 'ask_style') {
          nextMsg.text = "Принято. А какие разделы добавить на страницу? (Можно выбрать несколько)";
          nextMsg.isMulti = true;
          nextMsg.multiOptions = SECTIONS;
          nextState = 'ask_sections';
      } else if (chatState === 'ask_sections') {
          nextMsg.text = "Супер! Начинаю создание...";
          nextState = 'ready';
      } else {
          nextMsg.text = "Понял, вношу изменения...";
          nextState = 'ready';
      }

      setMessages(prev => [...prev, nextMsg]);
      setChatState(nextState);
      
      // Save Assistant Message
      if (user && currentChatId) {
          await supabase.from('chat_messages').insert({ chat_id: currentChatId, role: 'assistant', content: nextMsg.text });
      }
      
      if (nextState === 'ready') {
         triggerGeneration(userText); 
      } else {
        setIsGenerating(false);
      }
    }, 800);
  };

  const triggerGeneration = async (lastPrompt: string) => {
    if (!user && generationsLeft <= 0) {
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "⚠️ Лимит генераций исчерпан. Пожалуйста, войдите в аккаунт." }]);
       setIsGenerating(false);
       return;
    }

    if (user && generationsLeft <= 0 && !apiKey) {
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "⚠️ Лимит генераций исчерпан." }]);
       setIsGenerating(false);
       return;
    }
    
    const contextPrompt = messages.map(m => `${m.role}: ${m.text}`).join('\n') + `\nuser: ${lastPrompt}`;

    try {
       const keyToUse = apiKey || ""; 
       let html = "";
       if (keyToUse === "") {
         await new Promise(r => setTimeout(r, 2000));
         html = `<div class="bg-gray-950 text-white min-h-screen font-sans flex flex-col"><header class="border-b border-gray-800 p-6 flex justify-between items-center"><div class="font-bold text-xl tracking-tight text-indigo-500">LumaDemo</div><nav class="hidden md:flex gap-6 text-sm text-gray-400"><a href="#">About</a></nav></header><main class="flex-1 flex flex-col items-center justify-center p-8 text-center"><h1 class="text-5xl font-bold mb-6">Generated with Luma</h1><p class="text-xl text-gray-400 mb-8">Based on your request. Sections: ${lastPrompt}</p><button class="bg-indigo-600 text-white px-8 py-3 rounded-full">Action</button></main></div>`;
       } else {
         html = await generateLanding(contextPrompt, keyToUse, currentCode || undefined);
       }
       const newHistory = history.slice(0, historyIndex + 1);
       newHistory.push(html);
       setHistory(newHistory);
       setHistoryIndex(newHistory.length - 1);
       
       if (!apiKey) {
           if (user) {
                const newCount = Math.max(0, generationsLeft - 1);
                setGenerationsLeft(newCount);
                await supabase.from('profiles').update({ generations_left: newCount }).eq('id', user.id);
                
                await supabase.from('projects').insert({
                  user_id: user.id,
                  chat_id: currentChatId,
                  code: html,
                  prompt: lastPrompt
                });
           } else {
               setGenerationsLeft(prev => Math.max(0, prev - 1));
           }
       }
       setViewMode('preview');
    } catch (err: any) {
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: `Ошибка: ${err.message}` }]);
    } finally {
       setIsGenerating(false);
    }
  };

  const handleDownloadClick = () => {
    if (!currentCode) return;
    if (downloadsLeft <= 0) { alert("Купите скачивания!"); return; }
    setShowDownloadGuide(true);
  };

  const processDownload = async () => {
    const blob = new Blob([currentCode || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luma-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (user) {
        const newCount = Math.max(0, downloadsLeft - 1);
        setDownloadsLeft(newCount);
        await supabase.from('profiles').update({ downloads_left: newCount }).eq('id', user.id);
    } else {
    setDownloadsLeft(prev => Math.max(0, prev - 1));
    }
    setShowDownloadGuide(false);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      <PublishModal isOpen={publishModalOpen} onClose={() => setPublishModalOpen(false)} onPublish={handlePublish} code={currentCode || ''} />
      <DownloadGuideModal isOpen={showDownloadGuide} onClose={() => setShowDownloadGuide(false)} onConfirm={processDownload} />
      <ConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={confirmDelete} 
        title="Удалить чат?" 
        message="Это действие нельзя будет отменить. Вся история переписки и версии сайта будут удалены." 
      />
      <header className="h-14 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-4"><button onClick={onGoHome} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><ArrowRight className="rotate-180 w-4 h-4" /></button><div className="flex items-center gap-2 font-bold text-sm tracking-tight"><div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center"><Sparkles size={12} fill="white"/></div><span>Luma<span className="text-gray-500">Builder</span></span></div></div>
        <div className="flex items-center bg-[#151515] p-1 rounded-lg border border-white/5"><button onClick={() => setViewport('desktop')} className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Monitor size={16} /></button><button onClick={() => setViewport('tablet')} className={`p-1.5 rounded ${viewport === 'tablet' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Tablet size={16} /></button><button onClick={() => setViewport('mobile')} className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Smartphone size={16} /></button></div>
        <div className="flex items-center gap-3"><button onClick={() => setShowKeyInput(!showKeyInput)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5">{apiKey ? 'API Key Set' : 'Set API Key'}</button><button onClick={() => setPublishModalOpen(true)} disabled={!currentCode || !user} className="px-3 py-1.5 text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center gap-2 transition disabled:opacity-50 disabled:hover:bg-indigo-600"><Share2 size={14} /> Publish</button><Button variant="secondary" className="px-3 py-1.5 text-xs h-8" onClick={handleDownloadClick} disabled={!currentCode}><Download size={14} className="mr-2" /> Export</Button></div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[300px] bg-[#0A0A0A] border-r border-white/10 flex flex-col z-20 shrink-0 hidden md:flex">
           <div className="flex border-b border-white/10">
               <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'chat' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><MessageSquare size={14} className="mx-auto mb-1"/>Чат</button>
               <button onClick={() => setActiveTab('chats_list')} className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'chats_list' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><Layers size={14} className="mx-auto mb-1"/>История</button>
               <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}><HistoryIcon size={14} className="mx-auto mb-1"/>Версии</button>
           </div>
           
           <div className="px-4 py-2 bg-[#0F0F0F] border-b border-white/5 flex justify-between text-[10px] text-gray-400"><span className="flex items-center gap-1"><Zap size={10} className="text-yellow-500"/> {generationsLeft} gen</span><span className="flex items-center gap-1"><Download size={10} className="text-green-500"/> {downloadsLeft} dl</span><button onClick={() => { if(confirm('Купить скачивание за 100₽?')) setDownloadsLeft(d => d+1); }} className="text-indigo-400 hover:underline">Пополнить</button></div>
           
           <div className="flex-1 overflow-hidden relative flex flex-col">
             {activeTab === 'chat' && (
               <ChatInterface 
                  messages={messages} 
                  onSendMessage={handleUserResponse} 
                  onOptionClick={handleUserResponse}
                  onMultiOptionSubmit={(opts) => handleUserResponse(`Выбраны разделы: ${opts.join(', ')}`)}
                  isLoading={isGenerating} 
                    chats={chats}
                    currentChatId={currentChatId}
                    onNewChat={createNewChat}
                    onSelectChat={selectChat}
                    onDeleteChat={deleteChat}
               />
             )}
             {activeTab === 'chats_list' && (
                 <div className="flex flex-col h-full">
                    <div className="p-3 border-b border-white/5">
                        <button onClick={() => { createNewChat(); setActiveTab('chat'); }} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition">
                            <span className="text-lg leading-none">+</span> Новый чат
                        </button>
                    </div>
                    <ChatHistoryList chats={chats} currentChatId={currentChatId} onSelect={(id: string) => { selectChat(id); setActiveTab('chat'); }} onDelete={deleteChat} />
                 </div>
             )}
             {activeTab === 'history' && (
               <VersionsList history={history} currentIndex={historyIndex} onSelect={setHistoryIndex} />
             )}
           </div>
           {showKeyInput && (<div className="p-4 border-t border-white/10"><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key..." className="w-full bg-[#151515] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" /></div>)}
        </div>
        <div className="flex-1 bg-[#151515] flex flex-col relative overflow-hidden">
           <div className="h-10 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-center gap-1 p-1">
               <button onClick={() => setViewMode('preview')} className={`flex items-center gap-2 px-4 py-1 rounded text-xs font-medium transition ${viewMode === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Eye size={14}/> Preview</button>
               <button onClick={() => setViewMode('workflow')} className={`flex items-center gap-2 px-4 py-1 rounded text-xs font-medium transition ${viewMode === 'workflow' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}><Network size={14}/> Architecture</button>
           </div>
           <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-8 bg-dots">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              {!currentCode && !isGenerating && (<div className="text-center text-gray-600"><LayoutTemplate size={48} className="mx-auto mb-4 opacity-20" /><p>Начните диалог слева для создания сайта</p></div>)}
              {isGenerating && (<div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col"><div className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" /><h3 className="text-white font-bold mb-1">Luma AI is working</h3></div></div>)}
              {currentCode && (
                <>
                  {/* PREVIEW MODE MOCKUPS */}
                  <div className={`flex items-center justify-center w-full h-full ${viewMode === 'preview' ? 'flex' : 'hidden'} overflow-hidden`}>
                     {/* MOBILE MOCKUP */}
                     {viewport === 'mobile' && (
                       <div className="relative w-full h-full flex items-center justify-center p-4">
                           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-[375px] aspect-[375/812] max-h-full bg-black rounded-[40px] border-[8px] border-[#1f1f1f] shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[20px] w-[100px] bg-[#1f1f1f] rounded-b-[16px] z-20" />
                              <div className="flex-1 w-full bg-white rounded-[32px] overflow-hidden"><PreviewFrame htmlCode={currentCode} isLoading={false} /></div>
                       </motion.div>
                       </div>
                     )}
                     {/* TABLET MOCKUP */}
                     {viewport === 'tablet' && (
                       <div className="relative w-full h-full flex items-center justify-center p-4">
                           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-[768px] aspect-[768/1024] max-h-full max-w-full bg-black rounded-[24px] border-[8px] border-[#1f1f1f] shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full z-20" />
                              <div className="flex-1 w-full bg-white rounded-[16px] overflow-hidden"><PreviewFrame htmlCode={currentCode} isLoading={false} /></div>
                       </motion.div>
                       </div>
                     )}
                     {/* DESKTOP MOCKUP */}
                     {viewport === 'desktop' && (
                       <div className="relative w-full h-full flex items-center justify-center p-2 md:p-8">
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-6xl aspect-video bg-[#1a1a1a] rounded-t-xl border-t-[12px] border-x-[12px] border-[#1f1f1f] border-b-[40px] shadow-2xl ring-1 ring-white/10 flex flex-col max-h-full">
                              <div className="flex-1 w-full h-full bg-white overflow-hidden rounded-sm"><PreviewFrame htmlCode={currentCode} isLoading={false} /></div>
                          <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-600 tracking-widest uppercase">Luma</div>
                          <div className="absolute -bottom-[80px] left-1/2 -translate-x-1/2 w-32 h-10 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }} />
                          <div className="absolute -bottom-[84px] left-1/2 -translate-x-1/2 w-48 h-1 bg-[#1f1f1f] rounded-full shadow-lg" />
                       </motion.div>
                       </div>
                     )}
                  </div>

                  {/* ARCHITECTURE VIEW */}
                  {viewMode === 'workflow' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex items-center justify-center overflow-hidden">
                        <SiteArchitectureView code={currentCode} />
                    </motion.div>
                  )}
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};


// --- PROFILE PAGE ---

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setNewName(user.user_metadata?.name || '');
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        const { data: projectsData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        setProjects(projectsData || []);
      }
      setIsLoadingProjects(false);
    };
    fetchData();
  }, []);

  const handleUpdateName = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({ data: { name: newName } });
    if (!error) {
      setUser({ ...user, user_metadata: { ...user.user_metadata, name: newName } });
      setIsEditing(false);
    } else {
      alert('Ошибка обновления имени');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  // Animation variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onBack();
  };

  return (
    <div className="h-full bg-[#050505] text-white font-sans overflow-y-auto relative selection:bg-indigo-500/30 pb-20 custom-scrollbar">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>


      {/* Header */}
      <header className="h-20 flex items-center px-8 sticky top-0 z-40">
        <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md border-b border-white/5" />
        <div className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto">
           <div className="flex items-center gap-4 text-sm text-gray-400">
              <button onClick={onBack} className="hover:text-white transition flex items-center gap-2"><ArrowRight className="rotate-180" size={16}/> Главная</button>
              <span className="text-gray-600">/</span>
              <span className="text-white font-medium">Профиль</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-gray-400">
                 v2.5.0 Beta
              </div>
              <button onClick={handleLogout} title="Выйти" className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition text-gray-400 hover:text-red-400">
                 <LogOut size={16} />
              </button>
           </div>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto p-8 space-y-12 relative z-10"
      >
        {/* Profile Hero */}
        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl transition-opacity opacity-50 group-hover:opacity-100" />
          <div className="relative bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="relative">
               <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-[#111]">
                  {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
               </div>
               <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#111] rounded-full flex items-center justify-center border border-white/10 text-emerald-400" title="Online">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3 w-full relative z-10">
              <div className="flex items-center justify-center md:justify-start gap-3">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 bg-black/50 p-1 rounded-xl border border-indigo-500/50">
                    <input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-transparent text-xl font-bold text-white px-3 py-1 outline-none w-full"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"><Check size={16}/></button>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={16}/></button>
                  </motion.div>
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {user?.user_metadata?.name || 'Пользователь'}
                  </h1>
                )}
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-indigo-400 p-2 hover:bg-white/5 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 text-gray-400">
                 <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Mail size={14} className="text-indigo-400"/> {user?.email}
                 </div>
                 <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-300">
                    <Sparkles size={14} /> Pro Plan (Demo)
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { icon: <Zap className="text-yellow-400" />, label: "Генераций", value: profile?.generations_left ?? '-', sub: "Обновляется ежедневно", color: "from-yellow-400/20 to-orange-400/5" },
             { icon: <Download className="text-emerald-400" />, label: "Скачиваний", value: profile?.downloads_left ?? '-', sub: "Доступно для экспорта", color: "from-emerald-400/20 to-teal-400/5" },
             { icon: <Layers className="text-indigo-400" />, label: "Всего проектов", value: projects.length, sub: "Сохранено в облаке", color: "from-indigo-400/20 to-purple-400/5" }
           ].map((stat, i) => (
             <motion.div key={i} variants={item} whileHover={{ y: -5 }} className="relative overflow-hidden bg-[#111] border border-white/10 rounded-2xl p-6 group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                        {stat.icon}
                      </div>
                      {i === 0 && <div className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded text-gray-400">DAILY</div>}
                   </div>
                   <div>
                      <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-300">{stat.label}</div>
                      <div className="text-xs text-gray-500 mt-2">{stat.sub}</div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Projects History */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold flex items-center gap-3">
               <div className="w-1 h-6 bg-indigo-500 rounded-full" />
               История проектов
             </h2>
             <div className="text-sm text-gray-500">{projects.length} saved</div>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projects.map((p, i) => (
                 <motion.div 
                   key={p.id} 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="group bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full"
                 >
                    {/* Mock Preview Header */}
                    <div className="bg-[#0A0A0A] border-b border-white/5 p-3 flex items-center gap-2">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/50 transition-colors" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500/50 transition-colors" />
                       </div>
                       <div className="ml-auto text-[10px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors">index.html</div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                       <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                            {p.prompt || 'Без названия'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-4">
                            <Clock size={12} /> {formatDate(p.created_at)}
                          </div>
                       </div>
                       
                       <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
                          <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition flex items-center justify-center gap-2" onClick={() => alert('Скоро: просмотр кода')}>
                             <Code2 size={14}/> Код
                          </button>
                          <button className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-2" onClick={() => alert('Скоро: восстановление проекта')}>
                             <Redo size={14}/> Открыть
                          </button>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#111]/50 border border-white/10 rounded-3xl border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                 <LayoutTemplate size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Нет проектов</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Ваша история генераций пуста. Создайте свой первый сайт прямо сейчас!</p>
              <button onClick={onBack} className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition">
                 Создать проект
              </button>
            </div>
          )}
        </motion.div>

        {/* Achievements & Support */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Award className="text-yellow-500"/> Достижения</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Zap size={14}/></div>
                            <div>
                                <div className="text-sm font-bold">Первый шаг</div>
                                <div className="text-xs text-gray-500">Сгенерировать 1 сайт</div>
                            </div>
                        </div>
                        {projects.length > 0 ? <CheckCircle2 size={16} className="text-green-500"/> : <div className="text-xs text-gray-600">0/1</div>}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><LayoutTemplate size={14}/></div>
                            <div>
                                <div className="text-sm font-bold">Архитектор</div>
                                <div className="text-xs text-gray-500">Сгенерировать 10 сайтов</div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-600">{projects.length}/10</div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><HelpCircle className="text-emerald-500"/> Поддержка</h3>
                <div className="grid gap-3">
                    <a href="#" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm">Документация</span>
                        <ExternalLink size={14} className="text-gray-500"/>
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm">Сообщить о баге</span>
                        <MessageSquare size={14} className="text-gray-500"/>
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm">Telegram сообщество</span>
                        <Send size={14} className="text-gray-500"/>
                    </a>
                </div>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 3. PREVIEW COMPONENT
const PreviewFrame = ({ htmlCode, isLoading }: { htmlCode: string | null, isLoading: boolean }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => { }, [htmlCode]);
  const srcDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><script src="https://cdn.tailwindcss.com"></script><style>::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; } body { -webkit-font-smoothing: antialiased; }</style></head><body>${htmlCode || ''}</body></html>`;
  return <iframe ref={iframeRef} title="Preview" srcDoc={srcDoc} className="w-full h-full border-none block" sandbox="allow-scripts allow-modals allow-same-origin" />;
};

const PublicSiteView = ({ siteId }: { siteId: string }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
        const { data, error } = await supabase.from('projects').select('code, title').eq('id', siteId).single();
        if (error) {
            setError('Сайт не найден или был удален');
        } else {
            setHtml(data.code);
            document.title = data.title || 'Luma Site';
        }
        setLoading(false);
    };
    fetchSite();
  }, [siteId]);

  if (loading) return <div className="w-full h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (error) return <div className="w-full h-screen bg-black flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="w-full h-screen relative">
        <PreviewFrame htmlCode={html} isLoading={false} />
        <div className="absolute bottom-4 right-4 z-50">
            <a href={window.location.origin} className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10 hover:bg-black hover:border-indigo-500 transition-all">
                <Sparkles size={12} className="text-indigo-500" />
                Сделано в Luma
            </a>
        </div>
    </div>
  );
};

// --- MAIN APP ORCHESTRATOR ---

import ReactDOM from 'react-dom/client';

export default function AIBuilderApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'generator' | 'profile' | 'public_view'>('landing');
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const sid = params.get('site_id');
      if (sid) {
          setSiteId(sid);
          setCurrentView('public_view');
      }
  }, []);

  if (currentView === 'public_view' && siteId) {
      return <PublicSiteView siteId={siteId} />;
  }

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans selection:bg-indigo-500/30">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #52525b; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}</style>
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div key="landing" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <LandingPage onStartBuilder={(view: any) => setCurrentView(view || 'generator')} />
          </motion.div>
        )}
        {currentView === 'generator' && (
          <motion.div key="generator" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <GeneratorPage onGoHome={() => setCurrentView('landing')} />
          </motion.div>
        )}
        {currentView === 'profile' && (
          <motion.div key="profile" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <ProfilePage onBack={() => setCurrentView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AIBuilderApp />
  </React.StrictMode>
);