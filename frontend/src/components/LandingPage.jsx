import React from 'react';
import { Button } from './ui/button.tsx';
import {
  HeartPulse,
  Brain,
  Mic,
  Eye,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles,
  Shield,
  Globe,
  Award,
  Building2,
  ClipboardCheck,
  Users,
  Clock3,
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
    icon: <BookOpenIcon className="h-5 w-5" />,
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

function BookOpenIcon(props) {
  return <ClipboardCheck {...props} />;
}

function ImpactSection() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-10 dark:border-white/10 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {IMPACT_METRICS.map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                {metric.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="bg-white py-20 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Use Cases</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Built for real-world screening environments
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 md:text-lg">
            Advanced modules designed for healthcare operations, researchers, and education specialists.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                <span className="text-primary">{item.icon}</span>
                {item.tag}
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ onGetStarted }) {
  return (
    <section className="border-y border-slate-200/70 bg-slate-50 py-20 dark:border-white/10 dark:bg-slate-950/70">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">FAQs</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Common questions from clinical teams
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <h3 className="text-base font-bold text-slate-900 dark:text-white md:text-lg">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button className="h-12 rounded-full px-7 text-sm font-semibold" onClick={onGetStarted}>
              Start secure screening <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRibbon() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-5 dark:border-white/10 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span className="text-primary">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ onGetStarted }) {
  return (
    <section className="bg-white py-24 dark:bg-slate-950">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Clinical workflow</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Original experience designed for precision and speed
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Purpose-built interface blocks that keep the journey clear on mobile, tablet, and desktop.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((step, idx) => (
            <article key={step.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {step.icon}
                </span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" className="h-14 rounded-full px-8 text-base font-semibold" onClick={onGetStarted}>
            Start professional assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onGetStarted }) {
  return (
    <section className="bg-slate-950 py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.25),rgba(30,41,59,0.95),rgba(5,46,22,0.35))] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Ready to deploy</p>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Elevate your screening workflow with an advanced, accurate landing experience
            </h3>
            <p className="mt-4 text-base text-slate-200 md:text-lg">
              Everything from the hero to the conversion journey is now optimized for clarity, performance, and professional presentation.
            </p>
            <Button className="mt-8 h-14 rounded-full px-8 text-base font-semibold" onClick={onGetStarted}>
              Continue to sign in <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.10),_transparent_34%),radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.10),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_100%)] text-foreground flex flex-col selection:bg-primary/20">
      
      {/* 1. NAVIGATION HEADER */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
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
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative isolate overflow-hidden min-h-[calc(50vh+1px)] md:min-h-[calc(54vh+1px)] lg:min-h-[calc(60vh+1px)]">
        <div className="absolute inset-0 -z-40 bg-slate-950" aria-hidden="true" />
        <video
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[72%_48%] opacity-65 sm:object-[70%_46%] lg:object-[68%_44%]"
          src="/rotating_mind.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Rotating mind hero visual"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(108deg,rgba(2,6,23,0.97)_8%,rgba(2,6,23,0.92)_34%,rgba(2,6,23,0.86)_64%,rgba(2,6,23,0.95)_100%)]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:70px_70px]" aria-hidden="true" />

        <div className="container mx-auto flex min-h-[50vh] items-center justify-start px-4 py-8 sm:min-h-[54vh] sm:px-6 sm:py-9 lg:min-h-[60vh] lg:px-8 lg:py-10">
          <div className="fade-in-up w-full max-w-xl text-left">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/80 sm:text-[10px]">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Enterprise clinical screening platform
            </span>

            <h1 className="text-xl font-black leading-[1.05] text-white sm:text-2xl md:text-3xl lg:text-4xl">
              Advanced cognitive insights
              <span className="mt-3 block bg-gradient-to-r from-cyan-200 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
                with precision-ready workflows.
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-200 sm:text-xs sm:leading-5 md:text-sm md:leading-6">
              CogniDetect unifies memory, speech, ocular, and dyslexia screening into one professional interface built for modern hospitals, research organizations, and global care teams.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className="h-11 rounded-full px-6 text-sm font-semibold shadow-xl shadow-primary/20"
                onClick={onGetStarted}
              >
                Launch assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Secure access
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <Globe className="h-4 w-4 text-sky-300" />
                  Multi-region ready
                </span>
              </div>
            </div>

            <div className="mt-5 hidden gap-2 lg:grid lg:grid-cols-3">
              {[
                { value: '4', label: 'screening modules' },
                { value: '99.9%', label: 'secure access focus' },
                { value: '24/7', label: 'enterprise workflow' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden gap-2 xl:grid xl:grid-cols-3">
              {[
                { icon: <Brain className="h-4 w-4" />, label: 'Memory analytics' },
                { icon: <Mic className="h-4 w-4" />, label: 'Speech biomarkers' },
                { icon: <Eye className="h-4 w-4" />, label: 'Ocular tracking' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/55 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-6 hidden rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-2 backdrop-blur-md xl:flex xl:items-center xl:gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Live biomarker visualization</span>
          </div>
        </div>
      </section>

      <TrustRibbon />
      <ImpactSection />
      <UseCasesSection />

      {/* 3. MULTIMODAL FEATURE GRID */}
      <section className="border-y border-slate-200/70 bg-slate-50 py-24 dark:border-white/10 dark:bg-slate-950/70">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Operational overview</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              A professional workflow for global clinical environments
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Built to present clearly to hospitals, research organizations, and multinational care teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { 
                icon: <Brain className="h-8 w-8 text-primary" />, 
                title: "Memory screening", 
                desc: "Structured sequence and numeric recall testing with executive-friendly scoring." 
              },
              { 
                icon: <Mic className="h-8 w-8 text-blue-500" />, 
                title: "Speech analysis", 
                desc: "Audio-driven biomarker review with clear confidence indicators and clean summaries." 
              },
              { 
                icon: <Eye className="h-8 w-8 text-accent" />, 
                title: "Ocular tracking", 
                desc: "Focus and follow tests visualized for accurate risk interpretation." 
              },
              { 
                icon: <Activity className="h-8 w-8 text-purple-500" />, 
                title: "Trend analytics", 
                desc: "Longitudinal reporting designed for management reviews and research workflows." 
              }
            ].map((feature, i) => (
              <div key={i} className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_15px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/80">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-slate-200 dark:bg-white/5 dark:group-hover:bg-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  <Target className="h-4 w-4 text-primary" />
                  Enterprise ready
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: 'Secure access',
                desc: 'Professional sign-in flow with clear privacy messaging and controlled access.'
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: 'Executive reporting',
                desc: 'High-contrast summaries and trend views for clinical managers and research staff.'
              },
              {
                icon: <Award className="h-5 w-5" />,
                title: 'Global-ready brand',
                desc: 'A refined visual system that fits multinational healthcare and technology environments.'
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection onGetStarted={onGetStarted} />

      <WorkflowSection onGetStarted={onGetStarted} />
      <FinalCta onGetStarted={onGetStarted} />

      {/* 4. FOOTER */}
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
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Trusted enterprise experience
              </div>
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

