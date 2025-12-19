import React, { useState } from 'react';
import API from '../api';
import { Mic, UploadCloud, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from './ui/button.tsx'; //

const SpeechAnalysis = ({ setSpeechScore }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [chunkDetails, setChunkDetails] = useState([]);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a file first.");
    
    setLoading(true);
    setError(null);
    setResult(null);
    setChunkDetails([]);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await API.post('/analyze-speech', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { risk_score, details } = response.data;
      setResult(risk_score);
      setChunkDetails(details || []);
      setSpeechScore(risk_score); // Update global state for final report
    } catch (err) {
      setError("Analysis failed. Ensure backend is running and model is present.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-card rounded-3xl border border-border shadow-xl transition-all duration-300">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-foreground">
        <Mic className="text-primary h-7 w-7" /> 
        Step 1: Speech Biomarkers
      </h2>
      
      {/* Upload Zone */}
      <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer relative">
        <input 
          type="file" 
          accept=".wav,.mp3" 
          onChange={(e) => setFile(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer" 
          id="audio-upload"
        />
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mb-4 border border-border group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-foreground font-bold text-lg mb-1">
            {file ? file.name : "Click to upload Audio"}
          </span>
          <p className="text-muted-foreground text-sm">Standard clinical passage (.wav or .mp3)</p>
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full h-14 mt-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" /> 
            Analyzing Biomarkers...
          </div>
        ) : "Analyze Voice"}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3 font-bold border border-destructive/20 animate-pulse">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {result !== null && (
        <div className="mt-8 space-y-6 fade-in-up">
          <div className="p-6 bg-muted/30 rounded-2xl border border-border relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-muted-foreground font-bold uppercase tracking-tighter">Diagnosis Report</span>
              <span className="text-4xl font-black text-primary">{result.toFixed(1)}% Risk</span>
            </div>
            
            {result > 50 ? (
               <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 font-black border border-destructive/20 uppercase tracking-widest text-xs">
                 <AlertCircle size={18} /> High Risk Detected
               </div>
            ) : (
               <div className="p-4 bg-accent/10 text-accent rounded-xl flex items-center gap-2 font-black border border-accent/20 uppercase tracking-widest text-xs">
                 <CheckCircle size={18} /> Low Risk / Normal
               </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          </div>

          {/* SECOND-BY-SECOND DETAILS */}
          {chunkDetails.length > 0 && (
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex justify-between items-center p-5 bg-muted/50 hover:bg-muted transition-colors font-bold text-foreground text-sm"
              >
                <span>Clinical Breakdown</span>
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {showDetails && (
                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {chunkDetails.map((chunk, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 flex justify-between items-center text-sm transition-colors ${
                        chunk.is_sick ? 'bg-destructive/5' : 'bg-accent/5'
                      }`}
                    >
                      <span className="font-mono font-bold text-muted-foreground w-20">
                        {chunk.time}
                      </span>
                      <span className={`font-black flex-1 px-4 tracking-tight ${
                        chunk.is_sick ? 'text-destructive' : 'text-accent'
                      }`}>
                        {chunk.is_sick ? "DETECTED" : "NORMAL"}
                      </span>
                      <span className="text-muted-foreground font-bold tabular-nums">
                        {chunk.confidence.toFixed(1)}% CF
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechAnalysis;