import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertCircle, BrainCircuit, Timer, CheckCircle } from 'lucide-react';
import API from '../api';

const PredictiveSentinel = ({ patientName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define our clinical threshold here so we can use it for fallbacks
  const CRITICAL_THRESHOLD = 80; 

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await API.get(`/agent/predict/${patientName}`);
        const history = res.data.history;
        
        // 1. Map the historical data to the "actual" key
        const chartData = history.map((score, i) => ({
          name: `M${i + 1}`,
          actual: score,
        }));
        
        // 2. The "Bridge": To make the two lines connect, the last historical 
        // point needs to have BOTH the 'actual' and 'predicted' values.
        const lastIndex = history.length - 1;
        chartData[lastIndex].predicted = history[lastIndex];

        // 3. Add the future forecast point
        chartData.push({
          name: "6-Mo Forecast",
          predicted: res.data.prediction
        });

        setData({ ...res.data, chartData: chartData });
      } catch (err) {
        console.error("Prediction API failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (patientName) fetchPrediction();
  }, [patientName]);

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-slate-400">Sentinel Agent calculating velocity...</div>;
  if (!data) return null;

  const isCriticalForecast = data.prediction >= CRITICAL_THRESHOLD;

  return (
    <div className="space-y-6 fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- CHART COLUMN --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <TrendingUp className="text-indigo-600" size={20} /> Velocity Forecasting
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
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                
                {/* 1. The Threshold Line (Straight across) */}
                <ReferenceLine 
                  y={CRITICAL_THRESHOLD} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'CRITICAL THRESHOLD', fill: '#ef4444', fontSize: 10, fontWeight: '900' }} 
                />

                {/* 2. The Actual History (Solid Blue) */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
                
                {/* 3. The Predicted Future (Dashed Red) */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- AI ANALYSIS COLUMN WITH THRESHOLD FALLBACK --- */}
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border shadow-lg transition-colors ${isCriticalForecast ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            
            <div className={`flex items-center gap-2 mb-4 ${isCriticalForecast ? 'text-red-600' : 'text-emerald-600'}`}>
              {isCriticalForecast ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="font-black text-xs uppercase tracking-widest">
                {isCriticalForecast ? 'Sentinel Alert' : 'Status Clear'}
              </span>
            </div>
            
            <h4 className="text-4xl font-black text-slate-900 mb-1">{data.prediction}%</h4>
            <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-tighter">Predicted Risk in 6 Months</p>
            
            <div className="bg-white/60 p-4 rounded-2xl text-xs font-medium text-slate-800 leading-relaxed border border-white">
              <BrainCircuit size={16} className={`mb-2 ${isCriticalForecast ? 'text-red-500' : 'text-emerald-500'}`} />
              
              {/* Fallback Check: If prediction crosses threshold, show urgent action, else show stable note */}
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
    </div>
  );
};

export default PredictiveSentinel;