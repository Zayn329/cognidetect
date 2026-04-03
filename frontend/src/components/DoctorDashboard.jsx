import React, { useState, useEffect } from 'react';

import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  BrainCircuit, 
  Users, 
  ArrowUpRight, 
  Search,
  Zap,
  ShieldAlert,
  Stethoscope,   // <--- Added this to stop the crash!
  AlertTriangle  // <--- Added this to stop the crash!
} from 'lucide-react';
import API from '../api'; 

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, avgRisk: 0 });

  // 1. Fetch initial data on load
  useEffect(() => {
    fetchTriageData();
  }, []);

  const fetchTriageData = async () => {
    try {
      const res = await API.get('/agent/triage');
      setPatients(res.data);
      
      // Calculate Stats for the Top Cards
      const crit = res.data.filter(p => p.status === "Critical").length;
      const avg = res.data.reduce((acc, curr) => acc + curr.risk_score, 0) / res.data.length;
      setStats({ total: res.data.length, critical: crit, avgRisk: avg.toFixed(1) });
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleRunTriage = async () => {
    setIsRunningAI(true);
    // Add a slight delay for "Dramatic Effect" during the pitch
    setTimeout(async () => {
      await fetchTriageData();
      setIsRunningAI(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Enterprise</span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Omni-Triage <span className="text-indigo-600">AI</span></h1>
            </div>
            <p className="text-slate-500 font-medium">Spandan Hospital Neurological Command Center</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm" />
            </div>
            <button 
              onClick={handleRunTriage}
              disabled={isRunningAI}
              className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isRunningAI ? <BrainCircuit className="animate-spin" size={18} /> : <Zap size={18} />}
              {isRunningAI ? "AI Analyzing..." : "Run AI Triage"}
            </button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Screenings" value={stats.total} icon={<Users className="text-indigo-600" />} color="indigo" />
          <StatCard title="Critical Flags" value={stats.critical} icon={<ShieldAlert className="text-red-600" />} color="red" />
          <StatCard title="Avg Stability Index" value={`${100 - stats.avgRisk}%`} icon={<Activity className="text-emerald-600" />} color="emerald" />
        </div>

        {/* --- MAIN CONTENT: TWO COLUMNS --- */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: THE TRIAGE LIST */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" /> Live Patient Queue
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sorted by AI Severity</span>
              </div>

              <div className="divide-y divide-slate-50">
                {patients.length > 0 ? patients.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                )) : (
                  <div className="p-20 text-center text-slate-400 font-bold">No Data. Run Seeder Script.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM ACTIVITY & LEGEND */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
              <h3 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-4">System Activity</h3>
              <div className="space-y-4">
                <ActivityItem time="2m ago" text="New screening from Panvel Clinic" />
                <ActivityItem time="15m ago" text="AI flagged High Risk: Zain P." color="text-red-400" />
                <ActivityItem time="1h ago" text="Database sync complete" />
              </div>
            </div>

            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
              <h3 className="text-indigo-900 font-black text-sm mb-2">Multimodal Consensus</h3>
              <p className="text-indigo-700/70 text-xs leading-relaxed">
                Risk scores are calculated across Ocular Saccades, Vocal Jitter (Praat), and Motor geometric stability.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className={`h-14 w-14 rounded-2xl bg-${color}-50 flex items-center justify-center`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  </div>
);


const PatientRow = ({ patient }) => {
  const isCritical = patient.status === "Critical";
  const hasAnomaly = patient.clinical_anomaly && patient.clinical_anomaly !== "None";
  
  return (
    <div className="p-5 hover:bg-slate-50 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
            {patient.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{patient.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #{patient.id}</span>
              
              {/* 🔥 NEW: Specialist Routing Badge */}
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                <Stethoscope size={10} /> {patient.recommended_specialist}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
              {patient.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-3">
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1 uppercase">
            <span>Risk Index</span>
            <span>{patient.risk_score}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-indigo-500'}`} 
              style={{ width: `${patient.risk_score}%` }} 
            />
          </div>
        </div>
        
        <div className="col-span-9 space-y-2">
            {/* The standard Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-xs text-slate-600 leading-relaxed relative">
              <ArrowUpRight className="absolute top-2 right-2 text-slate-300" size={14} />
              "{patient.summary}"
            </div>
            
            {/* 🔥 NEW: Anomaly Alert Banner */}
            {hasAnomaly && (
              <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-2 rounded-lg text-[11px] font-medium border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold text-amber-900">Clinical Anomaly Detected:</strong> {patient.clinical_anomaly}</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
const ActivityItem = ({ time, text, color = "text-slate-400" }) => (
  <div className="flex gap-3">
    <div className="w-1 bg-indigo-500 rounded-full" />
    <div>
      <p className={`text-[10px] font-bold ${color}`}>{time}</p>
      <p className="text-[11px] font-medium text-slate-300">{text}</p>
    </div>
  </div>
);

export default DoctorDashboard;