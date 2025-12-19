import React from 'react';
import { Button } from './ui/button.tsx';
import { HeartPulse, Brain, Mic, Eye, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      
      {/* 1. NAVIGATION HEADER */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="text-gradient">CogniDetect</span>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full font-bold border-primary/20 hover:bg-primary/5"
            onClick={onGetStarted}
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 animated-bg-pan opacity-20 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <div className="fade-in-up">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              AI-Powered Neurological Screening
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Detect Cognitive <br /> 
              <span className="text-gradient">Decline Early.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 font-medium">
              CogniDetect uses advanced multimodal biomarkers—speech, ocular tracking, and memory tests—to provide clinical-grade insights into your neurological health.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                onClick={onGetStarted}
              >
                Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-accent" />
                HIPAA Compliant & Secure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTIMODAL FEATURE GRID */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4">A Comprehensive Diagnostic Suite</h2>
            <p className="text-muted-foreground">Four specialized tests. One unified risk profile.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Brain className="h-8 w-8 text-primary" />, 
                title: "Memory Wizard", 
                desc: "Sequence and numeric recall tests to measure short-term retention." 
              },
              { 
                icon: <Mic className="h-8 w-8 text-blue-500" />, 
                title: "Speech Analysis", 
                desc: "Natural language processing to detect phonetic and semantic shifts." 
              },
              { 
                icon: <Eye className="h-8 w-8 text-accent" />, 
                title: "Ocular Tracking", 
                desc: "Testing saccadic movement and gaze stability via computer vision." 
              },
              { 
                icon: <Activity className="h-8 w-8 text-purple-500" />, 
                title: "Trend Analytics", 
                desc: "Longitudinal data tracking to monitor health changes over months." 
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-lg opacity-50">
            <HeartPulse className="h-5 w-5" />
            <span>CogniDetect © 2025</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Clinical Data</a>
            <a href="#" className="hover:text-primary transition-colors">Research</a>
          </div>
        </div>
      </footer>
    </div>
  );
}