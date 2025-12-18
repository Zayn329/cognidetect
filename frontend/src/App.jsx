import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SequenceMemoryGame from './games/SequenceMemoryGame';
import NumberMemoryGame from './games/NumberMemoryGame';
import SpeechAnalysis from './components/SpeechAnalysis';
import EyeTracking from './components/EyeTracking';
import ReportDashboard from './components/ReportDashboard';
import { ArrowRight, RotateCcw } from 'lucide-react';

function App() {
  const [patientName, setPatientName] = useState("");
  
  // Workflow State: "intro" | "sequence" | "number" | "multimodal"
  const [step, setStep] = useState("intro"); 
  // Tab State for the multimodal phase
  const [subTab, setSubTab] = useState("speech");

  // Scoring State
  const [memoryScores, setMemoryScores] = useState({ sequence: 0, number: 0 });
  const [speechScore, setSpeechScore] = useState(null);
  const [eyeScore, setEyeScore] = useState(null);

  // Calculate Average Memory Risk from both games
  const avgMemoryRisk = (memoryScores.sequence + memoryScores.number) / 2;

  const resetFlow = () => {
    if(window.confirm("Are you sure? This will reset the current session.")) {
        setStep("intro");
        setMemoryScores({ sequence: 0, number: 0 });
        setSpeechScore(null);
        setEyeScore(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar patientName={patientName} setPatientName={setPatientName} />
      
      <main className="ml-64 flex-1 p-8">
        {/* Progress Stepper Visual */}
        <div className="max-w-4xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-500 uppercase">Phase: {step.toUpperCase()}</span>
                {step !== "intro" && (
                    <button onClick={resetFlow} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold">
                        <RotateCcw size={14} /> RESET SESSION
                    </button>
                )}
            </div>
            <div className="flex gap-3">
                <div className={`flex-1 h-2 rounded-full ${['intro', 'sequence', 'number', 'multimodal'].indexOf(step) >= 0 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${['sequence', 'number', 'multimodal'].indexOf(step) >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${['number', 'multimodal'].indexOf(step) >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${step === 'multimodal' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* STEP 0: INTRO / NAME CHECK */}
          {step === "intro" && (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
                <p className="text-gray-500 mb-8">Ensure the patient name is entered in the sidebar to begin the sequential screening process.</p>
                <button 
                    disabled={!patientName}
                    onClick={() => setStep("sequence")}
                    className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all flex items-center gap-2 mx-auto"
                >
                    Start Sequence Memory Test <ArrowRight size={20} />
                </button>
            </div>
          )}

          {/* STEP 1: SEQUENCE MEMORY */}
          {step === "sequence" && (
            <SequenceMemoryGame onFinish={(score) => {
                setMemoryScores(prev => ({ ...prev, sequence: score }));
                setStep("number");
            }} />
          )}

          {/* STEP 2: NUMBER MEMORY */}
          {step === "number" && (
            <NumberMemoryGame onFinish={(score) => {
                setMemoryScores(prev => ({ ...prev, number: score }));
                setStep("multimodal");
            }} />
          )}

          {/* STEP 3: MULTIMODAL TESTING (Speech + Eye + Final) */}
          {step === "multimodal" && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-1.5 mb-8 inline-flex border border-gray-200">
                {["speech", "eye", "report"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      subTab === tab 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab === "speech" && "🎙️ Speech"}
                    {tab === "eye" && "👁️ Eye Tracking"}
                    {tab === "report" && "📊 Final Report"}
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in duration-500">
                {subTab === "speech" && <SpeechAnalysis setSpeechScore={setSpeechScore} />}
                {subTab === "eye" && <EyeTracking eyeScore={eyeScore} setEyeScore={setEyeScore} />}
                {subTab === "report" && (
                    <ReportDashboard 
                        patientName={patientName}
                        memoryScore={avgMemoryRisk} // Pass average of both games
                        speechScore={speechScore} 
                        eyeScore={eyeScore} 
                    />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;