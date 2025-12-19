import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  FileText, Save, Download, Brain, Mic, Eye, Loader2, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Button } from './ui/button.tsx'; // Ensure this matches your Vite project path

const ReportDashboard = ({ patientName, memoryScore, speechScore, eyeScore }) => {
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 1. Multimodal Consensus Logic
  const mScore = memoryScore || 0;
  const sScore = speechScore || 0;
  const eScore = eyeScore || 0;
  
  const activeScores = [mScore, sScore, eScore].filter(s => s > 0);
  const overall = activeScores.length > 0 
    ? activeScores.reduce((a, b) => a + b, 0) / activeScores.length 
    : 0;

  const getNote = () => {
    const parts = [];
    if (mScore > 0) parts.push("Memory");
    if (sScore > 0) parts.push("Speech");
    if (eScore > 0) parts.push("Eye");
    return parts.length > 0 ? `Multimodal (${parts.join(" + ")})` : "No Data Collected";
  };

  // 2. Fetch History for Trend Graph
  useEffect(() => {
    if (patientName) {
      API.get(`/history/${patientName}`)
         .then(res => setHistory(res.data))
         .catch(err => console.error("History fetch error:", err));
    }
  }, [patientName]);

  // 3. Save to Database
  const handleSave = async () => {
    if (!patientName) return alert("Patient identity missing.");
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
      alert("Record saved to clinical database.");
      // Refresh history to update the graph
      const res = await API.get(`/history/${patientName}`);
      setHistory(res.data);
    } catch (err) {
        alert("Save failed. Ensure the Python backend is connected.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Generate PDF Report
  const handleDownload = async () => {
    if(!patientName) return alert("Patient name required.");
    setDownloading(true);
    try {
        // Blob type is required for PDF binary data
        const response = await API.get(`/generate-report/${patientName}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CogniDetect_Report_${patientName.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up DOM
    } catch (error) {
        alert("Download failed. You must 'Save Official Record' before generating a PDF.");
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* 1. MAIN SUMMARY PANEL */}
      <div className="bg-card p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-foreground">
          <FileText className="text-primary h-7 w-7" /> Diagnostic Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
            <Brain className="mx-auto mb-3 text-primary" size={28} />
            <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Memory Risk</div>
            <div className="text-4xl font-black text-foreground">{mScore.toFixed(1)}%</div>
          </div>
          
          <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center">
            <Mic className="mx-auto mb-3 text-blue-500" size={28} />
            <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">Speech Risk</div>
            <div className="text-4xl font-black text-foreground">{sScore.toFixed(1)}%</div>
          </div>

          <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 text-center">
            <Eye className="mx-auto mb-3 text-accent" size={28} />
            <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">Ocular Risk</div>
            <div className="text-4xl font-black text-foreground">{eScore.toFixed(1)}%</div>
          </div>
        </div>

        {/* 2. OVERALL CONCLUSION */}
        <div className="bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Multimodal Consensus Index</p>
                    <h3 className="text-6xl font-black text-gradient">{overall.toFixed(1)}%</h3>
                    <p className="text-slate-400 text-sm mt-3 font-medium italic">{getNote()}</p>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-64">
                    <Button 
                        onClick={handleSave}
                        disabled={saving || overall === 0}
                        className="w-full h-12 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        Save Record
                    </Button>
                    <Button 
                        onClick={handleDownload}
                        disabled={downloading}
                        variant="outline"
                        className="w-full h-12 rounded-xl font-bold border-slate-700 text-white hover:bg-slate-900"
                    >
                        {downloading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" size={18} />}
                        Generate PDF
                    </Button>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>
      </div>

      {/* 3. TREND VISUALIZATION */}
      {history.length > 0 && (
        <div className="bg-card p-8 rounded-3xl border border-border shadow-xl">
          <h3 className="text-xl font-black mb-8 text-foreground flex items-center gap-2">
            <TrendingUp className="text-primary" /> Longitudinal Health Trend
          </h3>
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(t) => new Date(t).toLocaleDateString()} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  fontWeight="bold"
                />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc' }}
                  labelFormatter={(t) => new Date(t).toLocaleString()} 
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'top', value: 'Critical Risk', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                <Line 
                  type="monotone" 
                  dataKey="overall_score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;