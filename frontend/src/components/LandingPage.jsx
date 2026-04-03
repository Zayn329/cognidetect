import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from './ui/button.tsx';
import {
  HeartPulse, Brain, Mic, Eye, ArrowRight, ShieldCheck, Activity,
  CheckCircle2, BarChart3, Target, Sparkles, Shield, Globe, Award,
  Building2, ClipboardCheck, Users, Clock3,
} from 'lucide-react';

const TRUST_ITEMS = [
  { icon: <ShieldCheck className="h-4 w-4" />, label: 'Encrypted by design' },
  { icon: <Building2 className="h-4 w-4" />, label: 'Enterprise deployment ready' },
  { icon: <Users className="h-4 w-4" />, label: 'Multi-team workflow support' },
  { icon: <Clock3 className="h-4 w-4" />, label: 'Fast screening experience' },
];

const WORKFLOW_STEPS = [
  {
    title: 'Capture multimodal signals',
    desc: 'Collect memory, speech, ocular, and dyslexia data in one guided clinical flow.',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    title: 'Review risk profile',
    desc: 'Convert complex biomarkers into an accurate, easy-to-read risk score for decision making.',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    title: 'Share actionable report',
    desc: 'Export professional summaries ready for operations, leadership, and care coordination teams.',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const FOOTER_GROUPS = [
  {
    title: 'Platform',
    links: ['Assessment Suite', 'Clinical Reports', 'Workflow Security', 'Role Access'],
  },
  {
    title: 'Resources',
    links: ['Research Notes', 'Implementation Guide', 'Help Center', 'Release Notes'],
  },
  {
    title: 'Company',
    links: ['About CogniDetect', 'Leadership', 'Partnerships', 'Contact'],
  },
];

const IMPACT_METRICS = [
  { value: '2.7x', label: 'Faster clinical triage' },
  { value: '94%', label: 'Reviewer confidence' },
  { value: '<5 min', label: 'Average completion time' },
  { value: '1 dashboard', label: 'Unified risk view' },
];

const USE_CASES = [
  {
    title: 'Hospital pre-screening',
    desc: 'Run high-volume cognitive screening before specialist referral with a consistent risk framework.',
    tag: 'Healthcare Operations',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: 'Research cohorts',
    desc: 'Collect multimodal biomarkers in standardized flows for longitudinal research and reporting.',
    tag: 'Clinical Research',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Education support pathways',
    desc: 'Identify dyslexia-related risk early and route students to suitable intervention programs.',
    tag: 'Education Programs',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How long does a full assessment take?',
    answer: 'Most sessions complete in under 5 minutes, depending on selected modules and connectivity.',
  },
  {
    question: 'Can teams use this across locations?',
    answer: 'Yes. The workflow is built for distributed teams with a consistent interface and central reporting.',
  },
  {
    question: 'Is the report format suitable for professionals?',
    answer: 'Reports are structured for clinical and operational audiences with clear scores and trend insights.',
  },
];

function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="border-y border-slate-200/70 bg-white py-10 dark:border-white/10 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {IMPACT_METRICS.map((metric, idx) => (
            <motion.article
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition-all dark:border-white/10 dark:bg-white/5"
              whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <motion.p
                className="text-2xl font-black text-slate-900 dark:text-white"
                initial={{ scale: 0.8 }}
                animate={isInView ? { scale: 1 } : { scale: 0.8 }}
              >
                {metric.value}
              </motion.p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                {metric.label}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="bg-white py-20 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Use Cases</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Built for real-world screening environments
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-7 shadow-sm dark:border-white/10 dark:bg-white/5"
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            >
              <motion.div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300" whileHover={{ scale: 1.05 }}>
                <span className="text-primary">{item.icon}</span>
                {item.tag}
              </motion.div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ onGetStarted }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="border-y border-slate-200/70 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/70">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div className="mb-10 text-center" ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">FAQs</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Common questions from clinical teams
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <motion.article
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 cursor-pointer"
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                whileHover={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="text-base font-bold text-slate-900 dark:text-white md:text-lg flex items-center justify-between">
                  {item.question}
                  <motion.span animate={{ rotate: expandedIdx === idx ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-primary">▼</motion.span>
                </div>
                <motion.p
                  initial={false}
                  animate={{ height: expandedIdx === idx ? 'auto' : 0, opacity: expandedIdx === idx ? 1 : 0, marginTop: expandedIdx === idx ? 8 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm leading-6 text-slate-600 dark:text-slate-300 overflow-hidden"
                >
                  {item.answer}
                </motion.p>
              </motion.article>
            ))}
          </div>

          <motion.div className="mt-10 flex justify-center" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <Button className="h-12 rounded-full px-7 text-sm font-semibold" onClick={onGetStarted}>
              Start secure screening <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustRibbon() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section className="border-y border-slate-200/70 bg-white py-5 dark:border-white/10 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div ref={ref} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.5 }}>
          {TRUST_ITEMS.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <span className="text-primary">{item.icon}</span>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowSection({ onGetStarted }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div className="mx-auto mb-14 max-w-3xl text-center" ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Clinical workflow</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Original experience designed for precision and speed
          </h2>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((step, idx) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-7 shadow-sm dark:border-white/10 dark:bg-white/5"
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <motion.span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary" whileHover={{ scale: 1.1, rotate: 10 }}>
                  {step.icon}
                </motion.span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.desc}</p>
            </motion.article>
          ))}
        </div>

        <motion.div className="mt-10 flex justify-center" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 0.5, duration: 0.6 }}>
          <Button size="lg" className="h-14 rounded-full px-8 text-base font-semibold" onClick={onGetStarted}>
            Start professional assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta({ onGetStarted }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="bg-slate-950 py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.25),rgba(30,41,59,0.95),rgba(5,46,22,0.35))] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:p-12"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
          whileHover={{ boxShadow: '0 50px 100px rgba(2, 6, 23, 0.6)' }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Elevate your screening workflow with advanced, accurate clinical experience
            </h3>
            <p className="mt-4 text-base text-slate-200 md:text-lg">
              Everything from the hero to the conversion journey is now optimized for clarity, performance, and professional presentation.
            </p>
            <Button className="mt-8 h-14 rounded-full px-8 text-base font-semibold" onClick={onGetStarted}>
              Continue to sign in <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage({ onGetStarted, onViewPricing }) {
  const { scrollY } = useScroll();
  const navBgOpacity = useTransform(scrollY, [0, 100], [0.6, 0.95]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.10),_transparent_34%),radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.10),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_100%)] text-foreground flex flex-col selection:bg-primary/20">
      
      {/* NAVIGATION HEADER */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60"
        style={{ opacity: navBgOpacity }}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3 font-black text-xl tracking-tight text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-white/45">Clinical Intelligence</span>
              <span className="text-2xl">CogniDetect</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden rounded-full px-5 font-semibold text-white/80 hover:bg-white/10 hover:text-white md:inline-flex"
              onClick={onViewPricing}
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              className="hidden rounded-full px-5 font-semibold text-white/80 hover:bg-white/10 hover:text-white md:inline-flex"
              onClick={onGetStarted}
            >
              Sign in
            </Button>
            <Button
              className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20"
              onClick={onGetStarted}
            >
              Start assessment
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION - FULL SCREEN ADVANCED */}
      <section className="relative w-full min-h-[90vh] overflow-hidden bg-slate-950">
        {/* Background Video Layer */}
        <div className="absolute inset-0 -z-40 bg-slate-950" />
        <video
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[72%_48%]"
          src="/rotating_mind.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />

        {/* Advanced Gradient Overlays - Minimal overlay for text readability */}
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(108deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.05)_20%,rgba(2,6,23,0.03)_50%,rgba(2,6,23,0.08)_100%)]" />
        
        {/* Shimmer Effect Background */}
        <motion.div
          className="absolute inset-0 -z-25 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.1), transparent)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['200% center', '-200% center'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Radial Gradient Spotlight Effect */}
        <motion.div
          className="absolute -z-20 top-1/2 left-1/2 w-[800px] h-[800px] rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0) 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />

        {/* Animated Floating Orbs */}
        <motion.div
          className="absolute -z-15 top-20 right-10 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0) 70%)',
            boxShadow: '0 0 60px rgba(34,197,94,0.3)',
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute -z-15 bottom-20 left-5 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(3,102,214,0.2) 0%, rgba(3,102,214,0) 70%)',
            boxShadow: '0 0 80px rgba(3,102,214,0.25)',
          }}
          animate={{
            y: [0, 50, 0],
            x: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content Container - Flexbox for perfect centering */}
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
            <motion.div 
              className="w-full max-w-2xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.span
                variants={itemVariants}
                className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-900/20 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur-sm"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                Next-Gen Clinical Intelligence
              </motion.span>

              {/* Heading with Premium Typography & Glow Effect */}
              <motion.div
                className="relative"
              >
                <motion.h1 
                  variants={itemVariants}
                  className="relative mt-6 text-2xl font-black leading-[1.15] text-white sm:text-3xl md:text-4xl lg:text-5xl tracking-tight drop-shadow-2xl"
                >
                  Advanced cognitive
                  <motion.span
                    className="mt-3 block bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      backgroundSize: '200% 200%'
                    }}
                  >
                    insights unleashed
                  </motion.span>
                </motion.h1>
                {/* Glow Effect Behind Heading */}
                <motion.div
                  className="absolute -inset-4 -z-10 blur-2xl opacity-30 pointer-events-none"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.5) 0%, rgba(34,197,94,0.3) 100%)',
                  }}
                />
              </motion.div>

              {/* Subheading */}
              <motion.p 
                variants={itemVariants}
                className="mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-6 text-slate-300"
              >
                Unify memory, speech, ocular, and dyslexia screening with <span className="text-cyan-300 font-semibold">precision-ready workflows</span> built for the future of clinical assessment.
              </motion.p>

              {/* CTA Section */}
              <motion.div 
                variants={itemVariants}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.10, boxShadow: '0 30px 80px rgba(6, 182, 212, 0.6)' }}
                  whileTap={{ scale: 0.92 }}
                  className="relative group"
                >
                  {/* Button Glow Effect */}
                  <motion.div
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <Button 
                    className="relative h-12 rounded-full px-8 text-sm font-bold gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all"
                    onClick={onGetStarted}
                  >
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Launch Assessment
                    </motion.span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div className="flex flex-wrap gap-3 sm:gap-4" variants={itemVariants}>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/30 px-4 py-2.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm transition-all hover:border-emerald-500/80 hover:bg-emerald-900/50"
                    whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                    Secure & Compliant
                  </motion.div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-900/30 px-4 py-2.5 text-xs font-semibold text-sky-200 backdrop-blur-sm transition-all hover:border-sky-500/80 hover:bg-sky-900/50"
                    whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(3, 102, 214, 0.2)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    >
                      <Globe className="h-4 w-4" />
                    </motion.div>
                    Global Ready
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Stats Section */}
              <motion.div 
                variants={itemVariants}
                className="mt-14 grid grid-cols-3 gap-4 sm:gap-6"
              >
                {[
                  { number: '2.7x', label: 'Faster Triage', gradientFrom: 'from-cyan-500', gradientTo: 'to-emerald-500' },
                  { number: '94%', label: 'Confidence', gradientFrom: 'from-emerald-500', gradientTo: 'to-sky-500' },
                  { number: '<5m', label: 'To Complete', gradientFrom: 'from-sky-500', gradientTo: 'to-cyan-500' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden border border-white/10 p-4 backdrop-blur-md group"
                    whileHover={{ 
                      scale: 1.08,
                      borderColor: 'rgba(6, 182, 212, 0.7)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">{stat.number}</div>
                      <div className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-300">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Premium Enhanced */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="text-center">
            <motion.p 
              className="text-xs uppercase tracking-widest text-cyan-300 mb-4 font-semibold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Scroll to explore
            </motion.p>
            <div className="relative w-6 h-12 border-2 border-cyan-400/60 rounded-full flex justify-center overflow-hidden group hover:border-cyan-400">
              {/* Glow Effect */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-b from-cyan-500 to-transparent opacity-0 group-hover:opacity-20 blur-lg"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                className="w-1.5 h-2.5 bg-gradient-to-b from-cyan-400 to-emerald-400 rounded-full mt-2 shadow-lg shadow-cyan-400/50"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      <TrustRibbon />
      <ImpactSection />
      <UseCasesSection />

      {/* MULTIMODAL FEATURE GRID */}
      <section className="border-y border-slate-200/70 bg-slate-50 py-24 dark:border-white/10 dark:bg-slate-950/70">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Operational overview</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              A professional workflow for global clinical environments
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: <Brain className="h-8 w-8 text-primary" />, title: "Memory screening", desc: "Structured sequence and numeric recall testing with executive-friendly scoring." },
              { icon: <Mic className="h-8 w-8 text-blue-500" />, title: "Speech analysis", desc: "Audio-driven biomarker review with clear confidence indicators and clean summaries." },
              { icon: <Eye className="h-8 w-8 text-accent" />, title: "Ocular tracking", desc: "Focus and follow tests visualized for accurate risk interpretation." },
              { icon: <Activity className="h-8 w-8 text-purple-500" />, title: "Trend analytics", desc: "Longitudinal reporting designed for management reviews and research workflows." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_15px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 24px 80px rgba(15,23,42,0.12)' }}
              >
                <motion.div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5" whileHover={{ scale: 1.1, rotate: 10 }}>
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  <Target className="h-4 w-4 text-primary" />
                  Enterprise ready
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              { icon: <Shield className="h-5 w-5" />, title: 'Secure access', desc: 'Professional sign-in flow with clear privacy messaging and controlled access.' },
              { icon: <BarChart3 className="h-5 w-5" />, title: 'Executive reporting', desc: 'High-contrast summaries and trend views for clinical managers and research staff.' },
              { icon: <Award className="h-5 w-5" />, title: 'Global-ready brand', desc: 'A refined visual system that fits multinational healthcare and technology environments.' }
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <motion.div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary" whileHover={{ scale: 1.1 }}>
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection onGetStarted={onGetStarted} />
      <WorkflowSection onGetStarted={onGetStarted} />
      <FinalCta onGetStarted={onGetStarted} />

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200/70 bg-white py-14 dark:border-white/10 dark:bg-slate-950">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-10 border-b border-slate-200/80 pb-10 md:grid-cols-2 lg:grid-cols-5 dark:border-white/10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <HeartPulse className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Clinical Intelligence</p>
                  <h4 className="text-xl font-black text-slate-950 dark:text-white">CogniDetect</h4>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
                Advanced multimodal screening for organizations that require accurate analysis, clear reporting, and dependable workflow quality.
              </p>
            </div>

            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{group.title}</h5>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-5 pt-8 md:flex-row">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">CogniDetect © 2026. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" className="transition-colors hover:text-primary">Privacy</a>
              <a href="#" className="transition-colors hover:text-primary">Terms</a>
              <a href="#" className="transition-colors hover:text-primary">Compliance</a>
              <a href="#" className="transition-colors hover:text-primary">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
