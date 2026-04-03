import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Copy, Trash2, Sparkles, Brain, Settings, HelpCircle } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hi! 👋 Welcome to CogniDetect AI. I\'m your expert assistant for dementia and dyslexia information. How can I help you today?', 
      sender: 'bot', 
      timestamp: new Date(),
      copied: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const messagesEndRef = useRef(null);

  // Demo answers - 15 comprehensive Q&A pairs
  const demoAnswers = [
    { q: 'What are early signs of dementia?', a: 'Early signs include memory loss, difficulty concentrating, getting lost in familiar places, losing track of time, misplacing items, mood changes, and difficulty with familiar tasks. If you notice these symptoms, consult a healthcare professional.' },
    { q: 'What is dyslexia?', a: 'Dyslexia is a specific learning disability affecting reading and language processing. People with dyslexia may struggle with word recognition, spelling, and reading fluency, despite having average or above-average intelligence.' },
    { q: 'Can dyslexia be cured?', a: 'Dyslexia cannot be cured, but with proper intervention and support, people develop strong reading and writing skills. Early identification and evidence-based interventions are most effective.' },
    { q: 'What types of dementia exist?', a: 'Main types: Alzheimer\'s disease (60-80% of cases), Vascular dementia, Lewy body dementia, Frontotemporal dementia, and Mixed dementia. Each has different causes and progression patterns.' },
    { q: 'Is dementia hereditary?', a: 'Some forms like early-onset Alzheimer\'s can run in families. However, most dementia isn\'t directly inherited. Risk factors include age, genetics, cardiovascular health, and lifestyle.' },
    { q: 'How is dyslexia diagnosed?', a: 'Diagnosis involves comprehensive assessment including reading tests, cognitive evaluations, family history, and ruling out other causes. Early identification helps with timely intervention.' },
    { q: 'What helps manage dementia?', a: 'Management includes cognitive stimulation, physical exercise, healthy diet, social engagement, mental health support, and medications as prescribed. A structured routine and safe environment are important.' },
    { q: 'What intervention strategies help dyslexia?', a: 'Effective approaches include multisensory learning, structured literacy programs, phonological training, assistive technology like text-to-speech, and educational accommodations.' },
    { q: 'What is mild cognitive impairment?', a: 'MCI is noticeable cognitive decline beyond normal aging but not severe enough for dementia diagnosis. It increases dementia risk but doesn\'t always progress. Regular monitoring is recommended.' },
    { q: 'How can I support someone with dyslexia?', a: 'Provide encouragement, use multisensory teaching methods, allow extra time, use audiobooks and assistive tech, break tasks into smaller steps, and maintain positive reinforcement.' },
    { q: 'What lifestyle changes prevent dementia?', a: 'Exercise regularly, maintain cognitive stimulation, eat Mediterranean diet, manage cardiovascular risk factors, get quality sleep, stay socially connected, and manage stress effectively.' },
    { q: 'Dementia vs normal aging?', a: 'Normal aging: occasional memory lapses, slower processing. Dementia: persistent memory loss, difficulty with daily tasks, confusion, personality changes. Seek professional evaluation if concerned.' },
    { q: 'Does dyslexia affect intelligence?', a: 'No. Dyslexia is a language processing difference, not an intelligence indicator. Many with dyslexia are highly intelligent and successful with appropriate support.' },
    { q: 'Therapeutic approaches for dementia?', a: 'Approaches include cognitive stimulation therapy, reminiscence therapy, music therapy, art therapy, reality orientation, and validation therapy. Person-centered care is key.' },
    { q: 'Executive function and dyslexia?', a: 'Many with dyslexia experience executive function challenges like organization and planning. Understanding these patterns helps provide better support and accommodations.' }
  ];

  const SYSTEM_PROMPT = `You are CogniDetect AI - a specialized assistant for DEMENTIA and DYSLEXIA information.

EXPERTISE:
- Dementia: Alzheimer's, Vascular, Lewy Body, Frontotemporal, Mixed types
- Dyslexia: types, characteristics, assessment, evidence-based interventions
- Cognitive assessment and screening
- Support strategies and resources

COMMUNICATION:
- Be empathetic, professional, and evidence-based
- Keep responses concise (3-4 paragraphs max)
- Use simple language for complex concepts
- Suggest professional consultation for medical concerns
- Acknowledge limitations

BOUNDARIES: Focus exclusively on dementia and dyslexia. Politely redirect off-topic questions.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, copied: true } : msg));
    setTimeout(() => {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, copied: false } : msg));
    }, 2000);
  };

  const clearChat = () => {
    setMessages([
      { 
        id: Date.now(), 
        text: 'Chat cleared. Feel free to ask me anything about dementia or dyslexia!', 
        sender: 'bot', 
        timestamp: new Date(),
        copied: false
      }
    ]);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const userMessage = { id: now.getTime(), text, sender: 'user', timestamp: now, copied: false };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${SYSTEM_PROMPT}\n\nUser: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const reply = response.text();

      const botMessage = {
        id: Date.now() + 1,
        text: reply,
        sender: 'bot',
        timestamp: new Date(),
        copied: false
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage = {
        id: Date.now(),
        text: "⚠️ Unable to process. Please check API key configuration.",
        sender: 'bot',
        timestamp: new Date(),
        copied: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button - Premium */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[150] w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-emerald-500 shadow-2xl shadow-cyan-500/50 flex items-center justify-center hover:shadow-cyan-500/70 transition-all group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0.8 }}>
              <X className="text-white w-7 h-7 font-bold" />
            </motion.div>
          ) : (
            <motion.div key="message" initial={{ rotate: 90, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0.8 }}>
              <Brain className="text-white w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full border-2 border-white/30" />
        <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} className="absolute inset-1 rounded-full border border-white/20" />
      </motion.button>

      {/* Chat Window - Advanced Premium Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-28 right-8 z-[140] w-[450px] h-[700px] rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950 border border-cyan-500/20 shadow-2xl shadow-cyan-900/40 overflow-hidden flex flex-col backdrop-blur-2xl"
          >
            {/* Premium Header */}
            <motion.div className="relative bg-gradient-to-r from-cyan-600/40 via-blue-600/40 to-emerald-600/40 backdrop-blur-md p-6 border-b border-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="p-2.5 bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                    <Brain className="text-cyan-300 w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-white text-base">CogniDetect AI</h3>
                    <p className="text-cyan-200 text-xs font-medium tracking-wide">Dementia & Dyslexia Expert</p>
                  </div>
                </div>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-400/80" />
              </div>
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {!showDemo ? (
                <>
                  {messages.map((msg, idx) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="group flex gap-2 items-end max-w-[85%]">
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm transition-all ${msg.sender === 'user' ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded-br-none shadow-lg shadow-cyan-500/40' : 'bg-slate-800/60 text-slate-200 border border-slate-700/50 rounded-bl-none hover:bg-slate-800/80'}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <span className="text-xs opacity-60 mt-1.5 block">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {msg.sender === 'bot' && (
                          <motion.button initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} onClick={() => copyMessage(msg.text, msg.id)} className="p-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700/80 text-cyan-300 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-slate-600/30">
                            {msg.copied ? <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-xs">✓</motion.span> : <Copy size={14} />}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-slate-800/60 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700/50 flex items-center gap-3 backdrop-blur-sm">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Loader className="h-4 w-4 text-cyan-400" />
                        </motion.div>
                        <span className="text-sm font-medium">CogniDetect is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 h-full flex flex-col">
                  <div className="text-center pt-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="inline-block mb-3">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <h4 className="text-base font-bold text-cyan-300 mb-1">Demo Answers</h4>
                    <p className="text-xs text-slate-400">15 Expert Responses • Click to Ask</p>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {demoAnswers.map((item, idx) => (
                      <motion.button key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} onClick={() => { setShowDemo(false); handleSendMessage(item.q); }} className="w-full text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 border border-slate-700/30 hover:border-cyan-500/50 transition-all group">
                        <p className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200 mb-1">Q: {item.q}</p>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2">{item.a}</p>
                      </motion.button>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </div>

            {/* Suggestions - Only on first message */}
            {messages.length <= 2 && !showDemo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 border-t border-slate-700/50 space-y-3 bg-slate-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Quick Topics</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['What are early dementia signs?', 'How is dyslexia diagnosed?', 'Types of dementia?', 'Manage dyslexia?'].map((q, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.03, x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => handleSendMessage(q)} className="text-xs px-2.5 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/50 transition-all text-left backdrop-blur-sm">
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="border-t border-slate-700/50 p-4 bg-gradient-to-t from-slate-950 to-slate-950/80 backdrop-blur-md space-y-3">
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearChat} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 flex items-center gap-1.5 transition-all backdrop-blur-sm border border-slate-700/30 hover:border-slate-600/50">
                  <Trash2 size={13} />
                  Clear
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDemo(!showDemo)} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all backdrop-blur-sm border ${showDemo ? 'bg-cyan-500/30 border-cyan-500/60 text-cyan-300' : 'bg-slate-800/40 border-slate-700/30 text-slate-300 hover:bg-slate-800/80'}`}>
                  <Sparkles size={13} />
                  Demo
                </motion.button>
                <span className="text-xs text-slate-500 ml-auto flex items-center">💬 {messages.length}</span>
              </div>
              {!showDemo && (
                <div className="flex gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(input)} placeholder="Ask about dementia or dyslexia..." className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all backdrop-blur-sm" />
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleSendMessage(input)} disabled={!input.trim() || isLoading} className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed p-3 rounded-xl text-white transition-all shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60">
                    <Send size={18} strokeWidth={2.5} />
                  </motion.button>
                </div>
              )}
              <p className="text-xs text-slate-600 text-center">💡 Specialized in dementia & dyslexia • Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
          background-clip: padding-box;
        }
      `}</style>
    </>
  );
}