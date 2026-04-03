import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function Loading() {
  // Animated gradient background
  const gradientVariants = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Pulsing orb animation
  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Floating animation
  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Text loading animation
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-slate-950">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950"
        style={{
          backgroundSize: '200% 200%',
        }}
        variants={gradientVariants}
        animate="animate"
      />

      {/* Animated Orbs Background */}
      <motion.div
        className="absolute -z-5 top-1/4 left-1/4 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0) 70%)',
          boxShadow: '0 0 80px rgba(6,182,212,0.3)',
        }}
        variants={orbVariants}
        animate="animate"
      />

      <motion.div
        className="absolute -z-5 bottom-1/4 right-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0) 70%)',
          boxShadow: '0 0 100px rgba(34,197,94,0.2)',
        }}
        variants={orbVariants}
        animate="animate"
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 fixed inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Brain Icon */}
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative rounded-full bg-gradient-to-r from-slate-900 to-slate-800 p-8 border border-cyan-500/30">
              <Brain className="h-12 w-12 text-cyan-400" />
            </div>
          </motion.div>

          {/* Loading Text */}
          <div className="text-center">
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-black text-white mb-3"
            >
              <motion.span
                className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Initializing CogniDetect
              </motion.span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-slate-400 text-base sm:text-lg font-medium mb-2"
            >
              Preparing advanced cognitive assessment...
            </motion.p>

            {/* Loading Progress Indicator */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center gap-2"
            >
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Animated Text Sequence */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8"
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-sm text-cyan-300/70 font-mono tracking-widest"
            >
              Loading neural networks...
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Grid Pattern Background Detail */}
      <div className="absolute inset-0 -z-5 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />
    </div>
  );
}