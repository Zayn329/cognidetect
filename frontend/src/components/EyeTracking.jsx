import React, { useState } from 'react';
import API from '../api';
import { Eye, Target, MousePointer2, Loader2 } from 'lucide-react';

const EyeTracking = ({ eyeScore, setEyeScore }) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const runTest = async (type) => {
    setLoading(true);
    setStatusMsg(`Running ${type} test... Please focus on the tracker window.`);
    
    try {
      const response = await API.post(`/test-eye/${type}`);
      // Ensure score is treated as a number
      const scoreValue = typeof response.data.score === 'number' ? response.data.score : 0;
      const details = response.data.details || "Test finished.";
      
      if (eyeScore !== null) {
        setEyeScore((eyeScore + scoreValue) / 2);
      } else {
        setEyeScore(scoreValue);
      }
      
      setStatusMsg(`Test Complete. Risk: ${scoreValue.toFixed(1)}%. ${details}`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Error: Connection lost with eye tracker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 rounded-3xl border border-border shadow-xl">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
          <Eye className="text-primary h-7 w-7" /> 
          Step 2: Ocular Response Analysis
        </h2>
        <p className="text-muted-foreground mb-8">Testing saccadic movement and focus stability.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Focus Stability Card */}
          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center text-center">
            <Target className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-bold text-foreground">Gaze Fixation</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Keep gaze fixed on the red target for 10 seconds.</p>
            <button 
              onClick={() => runTest('focus')} 
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground transition-all"
            >
              {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "Start Focus Test"}
            </button>
          </div>

          {/* Saccadic Follow Card */}
          <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex flex-col items-center text-center">
            <MousePointer2 className="h-10 w-10 text-accent mb-3" />
            <h3 className="font-bold text-foreground">Saccadic Follow</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Track the moving object across the screen grid.</p>
            <button 
              onClick={() => runTest('follow')}
              disabled={loading}
              className="w-full py-3 bg-accent text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground transition-all"
            >
              {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "Start Follow Test"}
            </button>
          </div>

          {/* Ocular Risk Score Display */}
          <div className="p-6 bg-muted/30 rounded-2xl border border-border flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-tighter mb-2">Ocular Risk Score</h3>
            <div className="text-5xl font-black text-foreground">
              {/* Null guard added here to prevent toFixed crash */}
              {eyeScore !== null ? `${eyeScore.toFixed(1)}%` : "--"}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Calculated from gaze jitter.</p>
          </div>
        </div>
        
        {statusMsg && (
          <div className="mt-6 p-4 bg-primary/10 text-primary rounded-xl text-sm font-bold text-center border border-primary/20 animate-pulse">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeTracking;