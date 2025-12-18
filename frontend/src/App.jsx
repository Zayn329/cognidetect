import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SpeechAnalysis from './components/SpeechAnalysis';
import EyeTracking from './components/EyeTracking';
import ReportDashboard from './components/ReportDashboard';

function App() {
  const [patientName, setPatientName] = useState("");
  const [activeTab, setActiveTab] = useState("speech");

  // Global State for current session
  const [speechScore, setSpeechScore] = useState(null);
  const [eyeScore, setEyeScore] = useState(null);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar patientName={patientName} setPatientName={setPatientName} />
      
      <main className="ml-64 flex-1 p-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex border border-gray-200">
          {["speech", "eye", "report"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab === "speech" && "🎙️ Speech Analysis"}
              {tab === "eye" && "👁️ Eye Tracking"}
              {tab === "report" && "📊 Final Report"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === "speech" && <SpeechAnalysis setSpeechScore={setSpeechScore} />}
          {activeTab === "eye" && <EyeTracking eyeScore={eyeScore} setEyeScore={setEyeScore} />}
          {activeTab === "report" && (
            <ReportDashboard 
              patientName={patientName} 
              speechScore={speechScore} 
              eyeScore={eyeScore} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;