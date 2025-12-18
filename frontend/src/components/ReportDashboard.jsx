import React, { useEffect, useState } from 'react';
import API from '../api';
import { FileText, Save, Download, Brain, Mic, Eye, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const ReportDashboard = ({ patientName, memoryScore, speechScore, eyeScore }) => {
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  // 1. Multimodal Consensus Logic
  const mScore = memoryScore || 0;
  const sScore = speechScore || 0;
  const eScore = eyeScore || 0;
  
  // Calculate Global Overall Risk
  // We prioritize metrics that have data
  const activeScores = [mScore, sScore, eScore].filter(s => s > 0);
  const overall = activeScores.length > 0 
    ? activeScores.reduce((a, b) => a + b, 0) / activeScores.length 
    : 0;

  const getNote = () => {
    const parts = [];
    if (memoryScore > 0) parts.push("Memory");
    if (speechScore > 0) parts.push("Speech");
    if (eyeScore > 0) parts.push("Eye");
    return parts.length > 0 ? `Multimodal (${parts.join(" + ")})` : "No Data";
  };

  // 2. Fetch Patient History for the Graph
  useEffect(() => {
    if (patientName) {
      API.get(`/history/${patientName}`)
         .then(res => setHistory(res.data))
         .catch(err => console.error("History fetch error:", err));
    }
  }, [patientName]);

  // 3. Save to Database
  const handleSave = async () => {
    if (!patientName) return alert("Enter patient name first");
    setSaving(true);
    try {
      await API.post('/save-result', {
        patient_name: patientName,
        memory_score: mScore,
        speech_score: sScore,
        eye_score: eScore,
        overall_score: overall,
        notes: getNote()
      });
      alert("Multimodal Diagnosis saved successfully!");
      const res = await API.get(`/history/${patientName}`);
      setHistory(res.data);
    } catch (err) {
        console.error(err);
        alert("Failed to save result. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if(!patientName) return alert("Please enter a patient name");
    try {
        const response = await API.get(`/generate-report/${patientName}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CogniDetect_Report_${patientName}.pdf`);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        alert("Report generation failed. Ensure the patient has saved data.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
          <FileText className="text-indigo-600" /> Final Diagnostic Summary
        </h2>

        {/* Triple Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 text-center">
            <Brain className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-xs text-purple-600 font-bold uppercase tracking-widest">Memory Risk</div>
            <div className="text-3xl font-black text-purple-900">{mScore.toFixed(1)}%</div>
          </div>
          
          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
            <Mic className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-xs text-blue-600 font-bold uppercase tracking-widest">Speech Risk</div>
            <div className="text-3xl font-black text-blue-900">{sScore.toFixed(1)}%</div>
          </div>

          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
            <Eye className="mx-auto mb-2 text-indigo-600" size={24} />
            <div className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Eye Risk</div>
            <div className="text-3xl font-black text-indigo-900">{eScore.toFixed(1)}%</div>
          </div>
        </div>

        {/* Overall Conclusion Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl mb-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Combined Multimodal Risk</p>
                    <h3 className="text-5xl font-black">{overall.toFixed(1)}%</h3>
                    <p className="text-indigo-400 text-sm mt-2 font-medium">{getNote()}</p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleSave}
                        disabled={saving || overall === 0}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:bg-slate-700"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Official Record
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors"
                    >
                        <Download size={20} /> Generate PDF Report
                    </button>
                </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* History Visualization */}
        {history.length > 0 && (
          <div className="mt-10 pt-10 border-t border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-slate-700">📈 Patient Recovery / Decline Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(t) => new Date(t).toLocaleDateString()} 
                    stroke="#94a3b8" 
                    fontSize={12} 
                  />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelFormatter={(t) => new Date(t).toLocaleString()} 
                  />
                  <ReferenceLine y={70} label={{ position: 'top', value: 'High Risk', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="5 5" />
                  <Line 
                    type="monotone" 
                    dataKey="risk_score" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;