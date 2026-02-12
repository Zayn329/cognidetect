import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import API from '../api'; 
// Make sure API points to your backend (e.g., axios instance)

export default function ReadingTest({ onFinish }) {
  const webcamRef = useRef(null);
  const [tracking, setTracking] = useState(false);
  const [regressions, setRegressions] = useState(0);
  const [lastX, setLastX] = useState(null);
  const [debugStatus, setDebugStatus] = useState("Initializing...");

  // --- 1. TRACKING LOOP ---
  useEffect(() => {
    let interval;
    if (tracking) {
      interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          
          if (imageSrc) {
            try {
  const res = await API.post('/dyslexia/track-eye', { image: imageSrc });
  const currentX = res.data.x;

  if (currentX !== null) {
    setDebugStatus(`X Pos: ${currentX}`); // Visible debug text

    // SMOOTHING LOGIC:
    // Only count movement if it's a "deliberate" shift, not just noise.
    if (lastX !== null) {
      const diff = lastX - currentX; 
      
      // If the difference is POSITIVE, the eye moved LEFT (Regression).
      // We increased threshold to 0.10 to reduce false positives.
      if (diff > 0.10) { 
        console.log("Regression Detected!");
        setRegressions(prev => prev + 1);
      }
    }
    setLastX(currentX); // Always update position
  }
            } catch (err) {
              console.error("Tracking Error:", err);
            }
          }
        }
      }, 300); // Check every 300ms (approx 3 FPS)
    }
    return () => clearInterval(interval);
  }, [tracking, lastX]);

  // --- 2. FINISH TEST ---
  const handleFinish = () => {
    setTracking(false);
    // Scoring: 0-2 regressions is perfect (100%), >10 is high risk (0%)
    // Simple linear decay
    const finalScore = Math.max(0, 100 - (regressions * 8));
    onFinish(finalScore);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      
      {/* HEADER */}
      <h2 className="text-3xl font-black text-purple-600 mb-2">Reading Flow Analysis</h2>
      <p className="text-slate-500 mb-8">Read the text below naturally. We are analyzing your eye movement.</p>

      {/* WEBCAM (Hidden visually but active) */}
      <div className="relative w-full max-w-lg mb-6 opacity-50 h-32 overflow-hidden rounded-xl border-2 border-purple-200">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
          className="absolute top-0 left-0"
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Debug: {debugStatus}
        </div>
      </div>

      {/* TEXT BOX */}
      <div className="max-w-3xl bg-white p-10 rounded-2xl shadow-xl border-l-8 border-purple-500 mb-8">
        <p className="text-2xl font-serif leading-loose text-gray-800">
          "The sun was setting behind the tall mountains. A small bird flew across the sky, 
          searching for its nest in the thick green forest below. The wind whispered through 
          the trees, carrying the scent of pine and damp earth."
        </p>
      </div>

      {/* STATS & CONTROLS */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Regressions</div>
          <div className="text-5xl font-black text-purple-600">{regressions}</div>
        </div>

        {!tracking ? (
          <button 
            onClick={() => { setTracking(true); setRegressions(0); }}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:scale-105 transition"
          >
            Start Analysis
          </button>
        ) : (
          <button 
            onClick={handleFinish}
            className="bg-red-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-600 shadow-lg hover:scale-105 transition"
          >
            Finish Reading
          </button>
        )}
      </div>
    </div>
  );
}