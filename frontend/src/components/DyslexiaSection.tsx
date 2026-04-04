// FILE: frontend/components/DyslexiaSection.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhonologyGame from './PhonologyGame';
import { 
  Headphones, 
  Zap, 
  BookOpen, 
  BarChart3, 
  ArrowRight, 
  Lock, 
  CheckCircle2,
  Brain,
  Lightbulb,
  Award,
  Clock,
  Target,
  Settings
} from 'lucide-react';

export default function DyslexiaSection() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const dyslexiaModules = [
    {
      id: 'phonology',
      title: 'Phonological Awareness',
      description: 'Test sound processing speed and rhyme recognition. Listen to audio prompts and match patterns.',
      icon: Headphones,
      color: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      difficulty: 'Beginner',
      duration: '5-7 min',
      accuracy: '85%',
      status: 'active',
      badge: 'Core Test',
    },
    {
      id: 'naming',
      title: 'Rapid Naming (RAN)',
      description: 'Measure automatic naming speed. Quickly identify objects, colors, or letters presented sequentially.',
      icon: Zap,
      color: 'from-amber-600 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      difficulty: 'Intermediate',
      duration: '3-5 min',
      accuracy: '92%',
      status: 'coming',
      badge: 'Session 2',
    },
    {
      id: 'reading',
      title: 'Reading Fluency',
      description: 'Assess reading speed and accuracy. Read passages and analyze comprehension with real-time feedback.',
      icon: BookOpen,
      color: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      difficulty: 'Intermediate',
      duration: '10-12 min',
      accuracy: '88%',
      status: 'coming',
      badge: 'Advanced',
    },
    {
      id: 'analysis',
      title: 'Performance Analytics',
      description: 'Comprehensive analysis of all dyslexia screening results with detailed metrics and recommendations.',
      icon: BarChart3,
      color: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      difficulty: 'Insights',
      duration: 'Real-time',
      accuracy: 'AI Score',
      status: 'coming',
      badge: 'Dashboard',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-b from-blue-600/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-t from-cyan-600/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!gameStarted ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl"
                  >
                    <Brain className="text-white w-8 h-8" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      Dyslexia Screening Module
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Comprehensive assessment system with AI-powered analysis</p>
                  </div>
                </div>
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10"
              >
                {[
                  { icon: Target, label: '4 Tests', color: 'text-blue-400' },
                  { icon: Clock, label: '20-25 min', color: 'text-cyan-400' },
                  { icon: Award, label: 'Certified', color: 'text-emerald-400' },
                  { icon: Lightbulb, label: 'AI Powered', color: 'text-amber-400' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`${item.color} w-5 h-5`} />
                      <span className="text-sm font-semibold text-slate-300">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Modules Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
              >
                {dyslexiaModules.map((module) => {
                  const Icon = module.icon;
                  const isLocked = module.status === 'coming';

                  return (
                    <motion.div
                      key={module.id}
                      variants={itemVariants}
                      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
                      className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                        isLocked
                          ? 'border-slate-700/30 opacity-60 pointer-events-none'
                          : 'border-slate-700/50 hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-500/20'
                      }`}
                    >
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                      {/* Content */}
                      <div className="relative p-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl h-full flex flex-col">
                        {/* Top section */}
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`p-3 bg-gradient-to-br ${module.color} rounded-xl shadow-lg`}
                          >
                            <Icon className="text-white w-8 h-8" />
                          </motion.div>
                          <div className="flex items-center gap-2">
                            {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              module.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                            }`}>
                              {module.badge}
                            </span>
                          </div>
                        </div>

                        {/* Title and description */}
                        <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                        <p className="text-slate-300 text-sm mb-6 flex-grow">{module.description}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6 pt-4 border-t border-slate-700/30">
                          <div className="text-center">
                            <p className="text-slate-500 text-xs font-medium mb-1">Difficulty</p>
                            <p className="text-white font-bold text-sm">{module.difficulty}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500 text-xs font-medium mb-1">Duration</p>
                            <p className="text-white font-bold text-sm">{module.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500 text-xs font-medium mb-1">Success Rate</p>
                            <p className="text-white font-bold text-sm">{module.accuracy}</p>
                          </div>
                        </div>

                        {/* Button */}
                        {!isLocked ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedModule(module.id);
                              if (module.id === 'phonology') {
                                setGameStarted(true);
                              }
                            }}
                            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${module.color} text-white shadow-lg hover:shadow-xl`}
                          >
                            Start Test
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            disabled
                            className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-700/30 text-slate-500 cursor-not-allowed"
                          >
                            Coming Soon
                            <Lock className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>

                      {/* Glow effect on hover */}
                      {!isLocked && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${module.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 -z-10 transition-opacity`}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 p-6 bg-gradient-to-r from-indigo-600/10 to-cyan-600/10 border border-indigo-500/20 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="font-bold text-white">Note:</span> These dyslexia screening tests are based on established assessment methodologies. 
                  Results are analyzed using AI to provide detailed insights. For clinical diagnosis, please consult with a qualified speech-language pathologist or educational psychologist.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setGameStarted(false);
                  setSelectedModule(null);
                }}
                className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Dyslexia Menu
              </motion.button>
              <PhonologyGame
                patientName="Demo User"
                onComplete={() => {
                  setGameStarted(false);
                  setSelectedModule(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}