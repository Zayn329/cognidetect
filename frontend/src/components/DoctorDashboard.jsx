import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  Clock,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertOctagon,
  Zap as Lightning,
  Eye,
  Gauge
} from 'lucide-react';
import API from '../api'; 

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, avgRisk: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTriageData();
  }, []);

  const fetchTriageData = async () => {
    try {
      const res = await API.get('/agent/triage');
      setPatients(res.data);
      
      const crit = res.data.filter(p => p.status === "Critical").length;
      const avg = res.data.reduce((acc, curr) => acc + curr.risk_score, 0) / res.data.length;
      setStats({ total: res.data.length, critical: crit, avgRisk: avg.toFixed(1) });
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleRunTriage = async () => {
    setIsRunningAI(true);
    setTimeout(async () => {
      await fetchTriageData();
      setIsRunningAI(false);
    }, 1200);
  };

  const filteredPatients = patients.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 font-sans text-slate-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-t from-cyan-600/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl">
                <BrainCircuit className="text-white" size={20} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Omni-Triage AI</h1>
                <p className="text-slate-400 text-sm font-medium">Advanced Neurological Assessment Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search patients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 shadow-lg backdrop-blur-sm transition-all" 
              />
            </div>
            <motion.button 
              onClick={handleRunTriage}
              disabled={isRunningAI}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/50 disabled:opacity-50"
            >
              {isRunningAI ? <BrainCircuit className="animate-spin" size={18} /> : <Lightning size={18} />}
              {isRunningAI ? "Analyzing..." : "Run AI Triage"}
            </motion.button>
          </div>
        </motion.div>

        {/* --- STATS GRID --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Screenings" 
            value={stats.total} 
            icon={<Users className="text-cyan-400" />} 
            gradient="from-cyan-600/20 to-blue-600/20"
            trend="+12%"
          />
          <StatCard 
            title="Critical Flags" 
            value={stats.critical} 
            icon={<AlertOctagon className="text-red-400" />} 
            gradient="from-red-600/20 to-pink-600/20"
            trend="High"
          />
          <StatCard 
            title="Avg Stability" 
            value={`${100 - stats.avgRisk}%`} 
            icon={<Gauge className="text-emerald-400" />} 
            gradient="from-emerald-600/20 to-green-600/20"
            trend="Stable"
          />
        </motion.div>

        {/* --- FILTERS --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex gap-3 mb-8">
          {['all', 'critical', 'stable'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilterStatus(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-800/40 text-slate-300 border border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              <Filter size={14} />
              {status.toUpperCase()}
            </motion.button>
          ))}
        </motion.div>

        {/* --- MAIN CONTENT: TWO COLUMNS --- */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: THE TRIAGE LIST */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="col-span-12 lg:col-span-8">
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Activity size={20} className="text-cyan-400" /> Live Patient Queue
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase">{filteredPatients.length} Found</span>
              </div>
              
              <div className="divide-y divide-slate-700/30 max-h-[600px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <PatientRow patient={patient} />
                    </motion.div>
                  )) : (
                    <div className="p-20 text-center text-slate-500 font-bold">No patients found. Run AI Triage.</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: SYSTEM ACTIVITY & LEGEND */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="col-span-12 lg:col-span-4 space-y-6">
            {/* System Activity */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
              <h3 className="text-cyan-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <Clock size={16} /> Live Activity
              </h3>
              <div className="space-y-4">
                <ActivityItem time="Just now" text="AI Analysis Complete" color="text-emerald-400" icon="✓" />
                <ActivityItem time="2m ago" text="New screening uploaded" icon="📤" />
                <ActivityItem time="15m ago" text="Critical risk detected" color="text-red-400" icon="⚠️" />
                <ActivityItem time="1h ago" text="Database sync success" color="text-cyan-400" icon="✓" />
              </div>
            </div>

            {/* Multimodal Consensus */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-3xl p-6 border border-indigo-500/30 backdrop-blur-xl">
              <h3 className="text-indigo-300 font-black text-sm mb-3">🧠 Multimodal Consensus</h3>
              <div className="space-y-3">
                <ConsensusItem label="Ocular Saccades" percent={85} />
                <ConsensusItem label="Vocal Jitter (Praat)" percent={78} />
                <ConsensusItem label="Motor Stability" percent={92} />
              </div>
            </div>

            {/* Key Indicators */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl">
              <h3 className="text-emerald-400 font-black text-sm mb-4">📊 Key Indicators</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">System Load</span>
                  <span className="text-cyan-400 font-bold">42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">API Response</span>
                  <span className="text-emerald-400 font-bold">120ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data Accuracy</span>
                  <span className="text-green-400 font-bold">98.5%</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 172, 254, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 172, 254, 0.5);
        }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, gradient, trend }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-slate-700/50 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all group`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-slate-800/50 rounded-xl group-hover:bg-slate-800 transition-all">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-emerald-400 text-xs font-bold flex items-center gap-1">
        {trend} <TrendingUp size={12} />
      </motion.div>
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
    <h4 className="text-3xl font-black text-white">{value}</h4>
  </motion.div>
);

const PatientRow = ({ patient }) => {
  const isCritical = patient.status === "Critical";
  const hasAnomaly = patient.clinical_anomaly && patient.clinical_anomaly !== "None";
  
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="p-6 hover:bg-slate-800/50 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${isCritical ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-indigo-500 to-cyan-500'}`}
          >
            {patient.name.charAt(0)}
          </motion.div>
          <div>
            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors text-lg">{patient.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-bold uppercase">ID: #{patient.id}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                <Stethoscope size={12} /> {patient.recommended_specialist}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg font-medium ${isCritical ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            {patient.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-3">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 uppercase">
            <span>Risk Index</span>
            <span className={isCritical ? 'text-red-400' : 'text-cyan-400'}>{patient.risk_score}%</span>
          </div>
          <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${patient.risk_score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isCritical ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'}`} 
            />
          </div>
        </div>
        
        <div className="col-span-9 space-y-2">
          <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 italic text-xs text-slate-300 leading-relaxed">
            "{patient.summary}"
          </div>
          
          {hasAnomaly && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-amber-500/10 text-amber-200 p-2.5 rounded-lg text-xs font-medium border border-amber-500/30"
            >
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span><strong className="font-bold text-amber-300">Anomaly Detected:</strong> {patient.clinical_anomaly}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ time, text, color = "text-slate-400", icon = "○" }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-3"
  >
    <div className={`text-lg ${color}`}>{icon}</div>
    <div className="flex-1">
      <p className={`text-xs font-bold ${color}`}>{time}</p>
      <p className="text-sm font-medium text-slate-300">{text}</p>
    </div>
  </motion.div>
);

const ConsensusItem = ({ label, percent }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="text-cyan-300 font-bold">{percent}%</span>
    </div>
    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" 
      />
    </div>
  </div>
);

export default DoctorDashboard;