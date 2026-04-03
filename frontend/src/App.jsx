import React, { useState, useEffect } from 'react';
import { auth } from "./lib/firebase.js"; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import API from './api'; 

// UI Components
import { Button } from './components/ui/button.tsx';
import Loading from "./components/loading.jsx";
import { 
  HeartPulse, 
  LogOut, 
  ArrowRight, 
  Brain, 
  Mic, 
  Eye, 
  FileText,
  Stethoscope, // <--- NEW ICON for Doctor toggle
  User         // <--- NEW ICON for Patient toggle
} from 'lucide-react';

// Specialized Modules
import Sidebar from './components/Sidebar';
import SequenceMemoryGame from './games/SequenceMemoryGame.jsx';
import NumberMemoryGame from './games/NumberMemoryGame.jsx';
import SpeechAnalysis from './components/SpeechAnalysis';
import EyeTracking from './components/EyeTracking.jsx';
import ReportDashboard from './components/ReportDashboard'; 
import PhonologyGame from './components/PhonologyGame'; 
import ReadingTest from './components/ReadingTest'; 
import HandwritingTest from './components/HandwritingTest'; 
import LoginPage from './components/auth/LoginPage.jsx';
import LandingPage from './components/LandingPage.jsx';

// 🔥 NEW: Import the Hospital Dashboard
import DoctorDashboard from './components/DoctorDashboard.jsx'; 

function App() {
  // 1. AUTH STATE
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // 2. WORKFLOW STATE
  // 🔥 NEW STATE: Toggle between Consumer App and Hospital B2B App
  const [appMode, setAppMode] = useState("patient"); // "patient" or "doctor"

  const [step, setStep] = useState("multimodal"); 
  const [subTab, setSubTab] = useState("report"); 

  // 3. DIAGNOSTIC DATA
  const [memoryScores, setMemoryScores] = useState({ sequence: 0, number: 0 });
  const [speechScore, setSpeechScore] = useState(null);
  const [eyeScore, setEyeScore] = useState(null);
  
  // 4. DYSLEXIA DATA
  const [phonologyScore, setPhonologyScore] = useState(0);
  const [readingScore, setReadingScore] = useState(0);
  const [writingScore, setWritingScore] = useState(0); 

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) return <Loading />;

  // PUBLIC ROUTING
  if (!user) {
    if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  // --- LOGIC: Handle Transitions ---
  const handleSequenceFinish = (score) => {
    setMemoryScores(prev => ({ ...prev, sequence: score }));
    setStep("number");
  };

  const handleNumberFinish = (score) => {
    setMemoryScores(prev => ({ ...prev, number: score }));
    setStep("multimodal");
  };

  const handleDyslexiaFinish = async (type, scoreValue) => {
    console.log(`Finished ${type} with score: ${scoreValue}`);
    
    if (type === 'phonology') {
      setPhonologyScore(scoreValue);
      setStep("reading_test"); 

    } else if (type === 'reading') {
      setReadingScore(scoreValue);
      setStep("writing_test"); 

    } else if (type === 'writing') {
      setWritingScore(scoreValue);
      setStep("multimodal"); 
      setSubTab("report");
    }
    
    try {
        if(user?.displayName) {
             await API.get(`/history/${user.displayName}`);
        }
    } catch (err) {
        console.warn("Background sync failed:", err);
    }
  };

  const avgMemoryRisk = (memoryScores.sequence + memoryScores.number) / 2;

  return (
    <div className="flex min-h-screen bg-background font-sans transition-colors duration-500">
      
      {/* Hide Sidebar if in Doctor Mode to give full width to the Dashboard */}
      {appMode === "patient" && <Sidebar patientName={user.displayName || "Patient"} />}

      <main className={`${appMode === "patient" ? "ml-64" : "ml-0"} flex-1 p-8 relative transition-all duration-300`}>
        
        {/* TOP NAV & MODE TOGGLE */}
        <div className="absolute top-8 right-8 flex items-center gap-6 z-50">
            
            {/* 🔥 THE HACKATHON PITCH TOGGLE 🔥 */}
            <div className="bg-slate-200/50 p-1 rounded-xl flex items-center shadow-inner">
              <button 
                onClick={() => setAppMode("patient")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${appMode === "patient" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <User size={16} /> Patient App
              </button>
              <button 
                onClick={() => setAppMode("doctor")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${appMode === "doctor" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Stethoscope size={16} /> Hospital Portal
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Current User</p>
                <p className="text-sm font-bold text-foreground">{user.displayName || user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="rounded-full hover:bg-destructive/10">
                <LogOut className="h-5 w-5 text-destructive" />
            </Button>
        </div>

        {/* ========================================= */}
        {/* VIEW 1: B2B HOSPITAL DASHBOARD (OMNI-TRIAGE) */}
        {/* ========================================= */}
        {appMode === "doctor" ? (
          <div className="pt-16 fade-in-up">
            <DoctorDashboard />
          </div>
        ) : (
        
        /* ========================================= */
        /* VIEW 2: CONSUMER PATIENT APP (EXISTING)  */
        /* ========================================= */
        <div className="max-w-4xl mx-auto pt-10">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                    <HeartPulse className="text-primary h-10 w-10" /> 
                    <span className="text-gradient">CogniDetect</span>
                </h1>
                <p className="text-muted-foreground font-medium">Step-by-step cognitive biomarker screening.</p>
            </header>
            
            {/* PROGRESS STEPPER */}
            {step !== "dyslexia_test" && step !== "reading_test" && step !== "writing_test" && (
                <div className="flex gap-3 mb-10">
                    <div className={`flex-1 h-2 rounded-full transition-all duration-700 ${['intro', 'sequence', 'number', 'multimodal'].includes(step) ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`flex-1 h-2 rounded-full transition-all duration-700 ${['sequence', 'number', 'multimodal'].includes(step) ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`flex-1 h-2 rounded-full transition-all duration-700 ${['number', 'multimodal'].includes(step) ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`flex-1 h-2 rounded-full transition-all duration-700 ${step === 'multimodal' ? 'bg-accent' : 'bg-muted'}`} />
                </div>
            )}

          {/* PHASE 0: SESSION START */}
          {step === "intro" && (
            <div className="bg-card p-12 rounded-3xl border border-border shadow-2xl text-center animated-bg-pan overflow-hidden relative">
                <div className="relative z-10">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Start Clinical Screening</h2>
                    <Button onClick={() => setStep("sequence")} size="lg" className="rounded-full px-12 py-6 text-lg font-bold shadow-xl shadow-primary/20">
                        Begin Sequence Test <ArrowRight className="ml-2" />
                    </Button>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            </div>
          )}

          {/* PHASE 1 & 2: MEMORY GAMES */}
          {step === "sequence" && <SequenceMemoryGame onFinish={handleSequenceFinish} />}
          {step === "number" && <NumberMemoryGame onFinish={handleNumberFinish} />}

          {/* PHASE 3: MULTIMODAL TESTING (Dashboard) */}
          {step === "multimodal" && (
            <div className="space-y-6">
              <div className="bg-muted p-1.5 rounded-2xl inline-flex border border-border">
                {[
                  { id: "speech", icon: <Mic size={18}/>, label: "Speech" },
                  { id: "eye", icon: <Eye size={18}/>, label: "Ocular" },
                  { id: "report", icon: <FileText size={18}/>, label: "Final Report" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSubTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      subTab === tab.id 
                        ? "bg-card text-primary shadow-lg" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="fade-in-up">
                {subTab === "speech" && <SpeechAnalysis setSpeechScore={setSpeechScore} />}
                {subTab === "eye" && <EyeTracking eyeScore={eyeScore} setEyeScore={setEyeScore} />}
                {subTab === "report" && (
                    <ReportDashboard 
                        patientName={user.displayName}
                        memoryScore={avgMemoryRisk} 
                        speechScore={speechScore} 
                        eyeScore={eyeScore} 
                        phonologyScore={phonologyScore}
                        readingScore={readingScore}
                        writingScore={writingScore} 
                        onStartDyslexia={() => setStep("dyslexia_test")}
                    />
                )}
              </div>
            </div>
          )}

          {/* PHASE 4, 5, 6: DYSLEXIA MODULES */}
          {step === "dyslexia_test" && (
            <div className="fade-in-up">
              <Button variant="ghost" onClick={() => setStep("multimodal")} className="mb-4">
                  ← Back to Dashboard
              </Button>
              <PhonologyGame 
                  patientName={user.displayName}
                  onComplete={(score) => handleDyslexiaFinish('phonology', score)}
              />
            </div>
          )}

          {step === "reading_test" && (
            <div className="fade-in-up">
              <ReadingTest 
                  patientName={user.displayName}
                  onFinish={(score) => handleDyslexiaFinish('reading', score)}
              />
            </div>
          )}

          {step === "writing_test" && (
            <div className="fade-in-up">
              <HandwritingTest 
                  onFinish={(score) => handleDyslexiaFinish('writing', score)}
              />
            </div>
          )}
          
        </div>
        )}
      </main>
    </div>
  );
}

export default App;