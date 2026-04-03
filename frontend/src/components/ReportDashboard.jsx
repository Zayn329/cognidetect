import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  FileText, Save, Download, Brain, Mic, Eye, Loader2, TrendingUp, 
  Activity, Ear, BookOpen, PenTool, BrainCircuit 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Button } from './ui/button';

// 🔥 IMPORT THE NEW AGENT COMPONENT
import PredictiveSentinel from './PredictiveSentinel';

const ReportDashboard = ({ 
  patientName, 
  // Dementia Scores
  memoryScore, 
  speechScore, 
  eyeScore,
  // Dyslexia Scores
  phonologyScore,
  readingScore,
  writingScore, 
  // Navigation
  onStartDyslexia 
}) => {
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // 🔥 ADDED 'insights' to the activeTab state possibilities
  const [activeTab, setActiveTab] = useState('dementia'); 

  // --- 1. DATA NORMALIZATION ---
  const mScore = memoryScore || 0;
  const sScore = speechScore || 0;
  const eScore = eyeScore || 0;
  
  const pScore = phonologyScore || 0; 
  const rScore = readingScore || 0;   
  const wScore = (writingScore !== undefined && writingScore !== null) ? writingScore : 0; 

  // --- 2. CONSENSUS LOGIC (THE MATH) ---
  const dementiaScores = [mScore, sScore, eScore].filter(s => s > 0);
  const dementiaOverall = dementiaScores.length > 0 
    ? dementiaScores.reduce((a, b) => a + b, 0) / dementiaScores.length 
    : 0;

  const pRisk = pScore > 0 ? ((5 - pScore) / 5) * 100 : 0;
  const rRisk = rScore;
  const wRisk = wScore;

  const activeDyslexiaTests = [];
  if (phonologyScore > 0) activeDyslexiaTests.push(pRisk);
  if (readingScore > 0) activeDyslexiaTests.push(rRisk);
  if (writingScore !== undefined && writingScore !== null) activeDyslexiaTests.push(wRisk);

  const dyslexiaOverall = activeDyslexiaTests.length > 0
    ? activeDyslexiaTests.reduce((a, b) => a + b, 0) / activeDyslexiaTests.length
    : 0;

  const getNote = () => activeTab === 'dementia' ? "Multimodal Consensus" : "Dyslexia Screening Module";

  // --- 3. API EFFECTS ---
  useEffect(() => {
    if (patientName) {
      API.get(`/history/${patientName}`)
         .then(res => setHistory(res.data))
         .catch(err => console.error("History fetch error:", err));
    }
  }, [patientName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/save-result', {
        patient_name: patientName,
        memory_score: mScore, speech_score: sScore, eye_score: eScore, overall_score: dementiaOverall,
        phonology_score: pScore,  
        reading_score: rScore, 
        writing_score: wScore, 
        dyslexia_risk: dyslexiaOverall, 
        notes: getNote()
      });
      alert("Full clinical record saved successfully.");
      const res = await API.get(`/history/${patientName}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
        const reportType = activeTab === 'dyslexia' ? 'dyslexia' : 'dementia';
        const response = await API.get(`/generate-report/${patientName}?type=${reportType}`, { 
            responseType: 'blob' 
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CogniDetect_${reportType}_Report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove(); 
    } catch (error) {
        alert("Download failed. Make sure you have saved the record first.");
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      
      {/* --- TAB SWITCHER --- */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
          <button 
            onClick={() => setActiveTab('dementia')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'dementia' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🧠 Dementia Screening
          </button>
          <button 
            onClick={() => setActiveTab('dyslexia')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'dyslexia' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📖 Dyslexia Screening
          </button>
          
          {/* 🔥 NEW AI FORECASTING TAB */}
          <button 
            onClick={() => setActiveTab('insights')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BrainCircuit size={16} /> AI Forecasting
          </button>
        </div>
      </div>

      {/* --- VIEW 1: PREDICTIVE SENTINEL (AGENT 4) --- */}
      {activeTab === 'insights' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PredictiveSentinel patientName={patientName} />
        </div>
      )}

      {/* --- VIEW 2: STANDARD DIAGNOSTIC REPORT --- */}
      {(activeTab === 'dementia' || activeTab === 'dyslexia') && (
        <>
          <div className="bg-card p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-foreground">
              {activeTab === 'dementia' ? <><FileText className="text-primary h-7 w-7" /> Dementia Diagnostic Summary</> : <><BookOpen className="text-purple-500 h-7 w-7" /> Dyslexia Diagnostic Summary</>}
            </h2>

            {/* DYSLEXIA GRID */}
            {activeTab === 'dyslexia' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-end mb-4">
                    <button onClick={onStartDyslexia} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-bold shadow-md">
                      <Ear size={20} /> Start Dyslexia Test
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-center">
                      <Ear className="mx-auto mb-3 text-purple-500" size={28} />
                      <div className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-1">Phonology</div>
                      <div className="text-4xl font-black text-foreground">{pScore > 0 ? `${pScore}/5` : '-'}</div>
                      <div className="text-xs text-muted-foreground mt-1">Rhyme Awareness (Score)</div>
                    </div>
                    
                    <div className="p-6 bg-pink-500/5 rounded-2xl border border-pink-500/10 text-center">
                      <Activity className="mx-auto mb-3 text-pink-500" size={28} />
                      <div className="text-[10px] text-pink-500 font-black uppercase tracking-widest mb-1">Reading Flow</div>
                      <div className="text-4xl font-black text-foreground">{rScore > 0 ? `${rScore}%` : '-'}</div>
                      <div className="text-xs text-muted-foreground mt-1">Regression Rate (Risk)</div>
                    </div>
                    
                    <div className="p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10 text-center">
                      <PenTool className="mx-auto mb-3 text-orange-500" size={28} />
                      <div className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Dysgraphia</div>
                      <div className="text-4xl font-black text-foreground">
                        {writingScore !== undefined && writingScore !== null ? `${wScore.toFixed(0)}%` : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Geometric Stability (Risk)</div>
                    </div>
                  </div>
              </div>
            )}

            {/* DEMENTIA GRID */}
            {activeTab === 'dementia' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            )}

            {/* CONCLUSION */}
            <div className="bg-slate-950 text-white p-8 rounded-3xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                          {activeTab === 'dementia' ? 'Multimodal Consensus Index' : 'Dyslexia Overall Risk Assessment'}
                        </p>
                        <h3 className="text-6xl font-black text-gradient">
                          {activeTab === 'dementia' ? dementiaOverall.toFixed(1) : dyslexiaOverall.toFixed(1)}%
                        </h3>
                        <p className="text-slate-400 text-sm mt-3 font-medium italic">{getNote()}</p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-64">
                        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Save Full Record
                        </Button>
                        <Button onClick={handleDownload} disabled={downloading} variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-700 text-white hover:bg-slate-900">
                            {downloading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" size={18} />}
                            Generate PDF
                        </Button>
                    </div>
                </div>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl opacity-20 ${activeTab === 'dementia' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
            </div>
          </div>

          {/* STATIC HISTORY GRAPH (Hidden when looking at AI Forecast) */}
          {history.length > 0 && (
            <div className="bg-card p-8 rounded-3xl border border-border shadow-xl">
                <div className="h-80 w-full pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString()} stroke="hsl(var(--muted-foreground))" fontSize={11} fontWeight="bold" />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} fontWeight="bold" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f8fafc' }} labelFormatter={(t) => new Date(t).toLocaleString()} />
                      <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'top', value: 'Critical Risk', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="overall_score" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportDashboard;