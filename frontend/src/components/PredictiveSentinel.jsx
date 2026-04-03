import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertCircle, BrainCircuit, Timer, CheckCircle, Brain, BookOpen } from 'lucide-react';
import API from '../api';

const PredictiveSentinel = ({ patientName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🔥 NEW STATE: Toggle between Dementia and Dyslexia forecasting
  const [scanType, setScanType] = useState('dementia'); 

  const CRITICAL_THRESHOLD = 80; 

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true); // Show loading state when switching tabs
      try {
        // Send the scan_type parameter to the backend
        const res = await API.get(`/agent/predict/${patientName}?type=${scanType}`);
        const history = res.data.history || [];
        
        if (history.length < 2) {
            setData({ ...res.data, insufficientData: true });
            setLoading(false);
            return;
        }

        const chartData = history.map((score, i) => ({
          name: `M${i + 1}`,
          actual: score,
        }));
        
        const lastIndex = history.length - 1;
        chartData[lastIndex].predicted = history[lastIndex];

        chartData.push({
          name: "6-Mo Forecast",
          predicted: res.data.prediction
        });

        setData({ ...res.data, chartData: chartData, insufficientData: false });
      } catch (err) {
        console.error("Prediction API failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientName) fetchPrediction();
  }, [patientName, scanType]); // Refetch if scanType changes!

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* --- CONTEXT TOGGLE --- */}
      <div className="flex justify-center mb-2">
        <div className="bg-slate-200/50 p-1 rounded-xl flex items-center shadow-inner">
          <button 
            onClick={() => setScanType("dementia")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${scanType === "dementia" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Brain size={16} /> Dementia Trend
          </button>
          <button 
            onClick={() => setScanType("dyslexia")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${scanType === "dyslexia" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <BookOpen size={16} /> Dyslexia Trend
          </button>
        </div>
      </div>

      {loading ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-400 uppercase tracking-widest text-sm">
            <BrainCircuit size={40} className="mx-auto mb-4 animate-bounce" />
            Sentinel Agent Recalibrating Matrix...
          </div>
      ) : data?.insufficientData ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-lg">
             <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
             <h3 className="text-xl font-black text-slate-800 mb-2">Insufficient Historical Data</h3>
             <p className="text-sm font-bold text-slate-400">{data.advice}</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* --- CHART COLUMN --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <TrendingUp className={scanType === "dementia" ? "text-blue-600" : "text-purple-600"} size={20} /> 
              {scanType} Velocity
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1 text-slate-400"><span className="w-3 h-0.5 bg-indigo-500"></span> Actual</span>
              <span className="flex items-center gap-1 text-red-500"><span className="w-3 h-0.5 border-b-2 border-dashed border-red-500"></span> Predicted</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1e293b' }} />
                
                <ReferenceLine y={CRITICAL_THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'CRITICAL THRESHOLD', fill: '#ef4444', fontSize: 10, fontWeight: '900' }} />

                <Line type="monotone" dataKey="actual" stroke={scanType === "dementia" ? "#2563eb" : "#9333ea"} strokeWidth={4} dot={{ r: 5, fill: scanType === "dementia" ? "#2563eb" : "#9333ea", strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- AI ANALYSIS COLUMN --- */}
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border shadow-lg transition-colors ${data.prediction >= CRITICAL_THRESHOLD ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className={`flex items-center gap-2 mb-4 ${data.prediction >= CRITICAL_THRESHOLD ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.prediction >= CRITICAL_THRESHOLD ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="font-black text-xs uppercase tracking-widest">{data.prediction >= CRITICAL_THRESHOLD ? 'Sentinel Alert' : 'Status Clear'}</span>
            </div>
            
            <h4 className="text-4xl font-black text-slate-900 mb-1">{data.prediction}%</h4>
            <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-tighter">Predicted Risk in 6 Months</p>
            
            <div className="bg-white/60 p-4 rounded-2xl text-xs font-medium text-slate-800 leading-relaxed border border-white">
              <BrainCircuit size={16} className={`mb-2 ${data.prediction >= CRITICAL_THRESHOLD ? 'text-red-500' : 'text-emerald-500'}`} />
              {data.advice}
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-3xl text-white flex items-center justify-between shadow-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Velocity</p>
              <p className={`text-lg font-bold capitalize ${data.trend === 'increasing' ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.trend} Trend
              </p>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Timer className={data.trend === 'increasing' ? 'text-red-400' : 'text-emerald-400'} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default PredictiveSentinel;