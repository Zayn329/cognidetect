import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Headphones, 
  Brain, 
  Zap, 
  CheckCircle, 
  Clock, 
  Award,
  Volume2,
  Target,
  Sparkles
} from 'lucide-react';
import PhonologyGame from './PhonologyGame';

const DyslexiaTestPage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  // Animated background blur elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const blur1 = document.getElementById('blur1');
      const blur2 = document.getElementById('blur2');
      if (blur1 && blur2) {
        blur1.style.left = `${e.clientX - 200}px`;
        blur1.style.top = `${e.clientY - 200}px`;
        blur2.style.left = `${e.clientX + 200}px`;
        blur2.style.top = `${e.clientY + 200}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Info cards data
  const infoCards = [
    {
      icon: Volume2,
      title: 'Sound Processing',
      description: 'Test your ability to recognize and process phonetic patterns'
    },
    {
      icon: Zap,
      title: 'Quick Response',
      description: 'Measure reaction time to auditory stimuli'
    },
    {
      icon: Brain,
      title: 'Cognitive Load',
      description: 'Evaluate phonological awareness and processing speed'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Animated background blur elements */}
      <div
        id="blur1"
        className="fixed w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
      />
      <div
        id="blur2"
        className="fixed w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
      />

      {/* Animated grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(88,199,250,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(88,199,250,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!gameStarted ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen px-6 py-8 flex flex-col items-center overflow-auto"
            >
              {/* Header */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-5xl mb-12"
              >
                <button
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-4 mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className="text-cyan-400" size={40} />
                  </motion.div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    Dyslexia Screening
                  </h1>
                </div>
                <p className="text-slate-400 text-lg">Comprehensive phonological assessment</p>
              </motion.div>

              {/* Main Assessment Card */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="w-full max-w-2xl mb-12"
              >
                <div className="relative group">
                  {/* Glow background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-emerald-500/30 rounded-2xl blur-xl"
                    animate={{ opacity: isHovering ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/30 rounded-2xl p-12 overflow-hidden">
                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <motion.div
                        animate={{ scale: isHovering ? 1.1 : 1, y: isHovering ? -5 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center mb-8"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur-lg opacity-50"
                          />
                          <div className="relative bg-gradient-to-r from-cyan-500 to-indigo-600 p-6 rounded-full">
                            <Headphones size={48} className="text-white" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Title and Description */}
                      <h2 className="text-4xl font-bold text-white mb-4">Phonological Awareness</h2>
                      <p className="text-slate-300 text-lg mb-2 max-w-xl mx-auto">
                        Test your auditory processing and phonetic recognition abilities
                      </p>
                      <p className="text-slate-500 text-sm max-w-xl mx-auto mb-8">
                        You will hear words and must match them with rhyming images as quickly and accurately as possible
                      </p>

                      {/* Key Points */}
                      <div className="flex items-center justify-center gap-8 mb-10 flex-wrap">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-cyan-400">
                          <Clock size={18} />
                          <span className="text-sm font-medium">5-10 min</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-emerald-400">
                          <Target size={18} />
                          <span className="text-sm font-medium">20 Questions</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-indigo-400">
                          <Zap size={18} />
                          <span className="text-sm font-medium">Real-time Scoring</span>
                        </motion.div>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        onClick={() => setGameStarted(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group/btn px-10 py-4 rounded-xl font-bold text-lg text-white overflow-hidden"
                      >
                        {/* Button background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 opacity-100 group-hover/btn:opacity-110 transition-opacity" />

                        {/* Animated shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Button content */}
                        <div className="relative flex items-center justify-center gap-2">
                          <Sparkles size={20} />
                          <span>Start Assessment</span>
                          <ArrowLeft size={20} className="rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Info Cards */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              >
                {infoCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group"
                    >
                      <div className="relative h-full">
                        {/* Glow on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Card */}
                        <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
                          {/* Icon */}
                          <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
                            <Icon className="text-cyan-400" size={24} />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                          <p className="text-slate-400 text-sm">{card.description}</p>

                          {/* Border animation on hover */}
                          <motion.div
                            className="absolute inset-0 rounded-xl border border-cyan-400 opacity-0 group-hover:opacity-100"
                            layoutId="border"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Footer info */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
                className="w-full max-w-5xl text-center"
              >
                <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Clinically Validated Assessment</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    This assessment tool has been developed and validated by cognitive psychology experts for early dyslexia screening
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen"
            >
              <PhonologyGame
                patientName="Muzzaffar Pawale"
                onComplete={() => {
                  alert("Test Complete! Results saved.");
                  navigate('/');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DyslexiaTestPage;