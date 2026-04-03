import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { HeartPulse, Loader2, ShieldCheck, Lock, BarChart3, ArrowLeft } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Branding Icon for the Login Button
const GoogleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.13-10.36 7.13-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function LoginPage({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // Triggers the Google Auth popup
      await signInWithPopup(auth, provider);
      // Success: App.jsx will detect the user via onAuthStateChanged and show the Dashboard
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
      alert("Login failed. Please check your internet connection or Firebase configuration.");
    }
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]"
        animate={{ backgroundPosition: ['0 0', '72px 72px'] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl lg:grid-cols-2 dark:bg-slate-950/90"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
        >
          <motion.aside
            className="relative hidden flex-col justify-between bg-[linear-gradient(155deg,#0f172a_0%,#075985_45%,#052e16_100%)] p-10 text-white lg:flex"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HeartPulse className="h-6 w-6" />
                </motion.span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.33em] text-white/70">Clinical Intelligence</p>
                  <h1 className="text-2xl font-black tracking-tight">CogniDetect</h1>
                </div>
              </motion.div>

              <motion.h2
                className="mt-12 text-4xl font-black leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Professional access
                <span className="mt-2 block text-cyan-200">for advanced cognitive screening.</span>
              </motion.h2>
              <motion.p
                className="mt-5 max-w-md text-sm leading-7 text-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Sign in securely to continue with clinical-grade screening, historical insights, and executive-ready reporting.
              </motion.p>
            </div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, staggerChildren: 0.1 }}
            >
              {[
                { icon: <ShieldCheck className="h-4 w-4" />, text: 'Secure authentication powered by Google' },
                { icon: <Lock className="h-4 w-4" />, text: 'Protected session and private user access' },
                { icon: <BarChart3 className="h-4 w-4" />, text: 'Clear dashboards and professional exports' },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition-all"
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-cyan-200">{item.icon}</span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </motion.aside>

          <motion.main
            className="flex items-center justify-center p-6 sm:p-10 lg:p-14"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="w-full max-w-md">
              <motion.div
                className="flex items-center justify-between gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  whileHover={{ scale: 1.05, backgroundColor: '#f8f8f8', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span animate={{ x: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </motion.span>
                  Back
                </motion.button>
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                    <Lock className="h-3.5 w-3.5" />
                  </motion.span>
                  Secure sign in
                </motion.div>
              </motion.div>

              <motion.h3
                className="mt-5 text-3xl font-black text-slate-950 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome back
              </motion.h3>
              <motion.p
                className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Continue to your private diagnostic workspace and start your clinical assessment flow.
              </motion.p>

              <motion.div
                className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
                whileHover={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="h-14 w-full gap-3 rounded-2xl border-slate-300 text-base font-bold"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Loader2 className="h-5 w-5 text-primary" />
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ rotate: 10 }}>
                        <GoogleIcon className="h-5 w-5" />
                      </motion.div>
                    )}
                    {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
                  </Button>
                </motion.div>

                <div className="my-5 h-px bg-slate-200 dark:bg-white/10" />

                <motion.div
                  className="space-y-3 text-xs text-slate-500 dark:text-slate-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.p className="flex items-center gap-2" whileHover={{ x: 5 }}>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Encrypted session and secure access controls
                  </motion.p>
                  <motion.p className="flex items-center gap-2" whileHover={{ x: 5 }}>
                    <Lock className="h-4 w-4 text-primary" />
                    Your diagnostic data stays private to your account
                  </motion.p>
                </motion.div>
              </motion.div>

              <motion.p
                className="mt-6 text-center text-xs leading-6 text-slate-500 dark:text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                By continuing, you agree to the CogniDetect Privacy Policy and Terms of Use.
              </motion.p>
            </div>
          </motion.main>
        </motion.div>
      </div>
    </motion.div>
  );
}