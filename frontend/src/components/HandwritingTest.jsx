import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import API from '../api';
import { Camera, CheckCircle, Upload, PenTool, AlertCircle } from 'lucide-react';

export default function HandwritingTest({ onFinish }) {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(null); // Score shown to user (High = Good)
  const [error, setError] = useState(null);

  // --- 1. CAPTURE & UPLOAD HANDLERS ---
  const capture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      processImage(image);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => processImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- 2. ANALYSIS LOGIC ---
  const processImage = async (base64Image) => {
    setImgSrc(base64Image);
    setAnalyzing(true);
    setError(null);

    try {
      const res = await API.post('/dyslexia/analyze-handwriting', { image: base64Image });
      
      // API returns a "Stability Score" (0-100, where 100 is perfect writing)
      const rawStability = res.data.writing_score;
      setStabilityScore(rawStability);

      // --- INVERSION LOGIC ---
      // We convert Stability (Good) into Risk (Bad) for the database
      // If Stability is 30/100 (Bad), Risk is 70/100 (High Risk)
      const dysgraphiaRisk = Math.max(0, 100 - rawStability);

      // Wait 2 seconds so user can see their score, then finish
      setTimeout(() => {
          onFinish(dysgraphiaRisk); 
      }, 2500);

    } catch (err) {
      console.error("Analysis failed", err);
      setAnalyzing(false);
      setError("Analysis failed. Please ensure good lighting and clear text.");
      setImgSrc(null);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-2xl mx-auto bg-white rounded-3xl shadow-xl">
      <div className="text-center mb-6">
        <PenTool className="w-12 h-12 text-purple-600 mx-auto mb-3" />
        <h2 className="text-2xl font-black text-slate-800">Dysgraphia Screening</h2>
        <p className="text-slate-500 mt-2">
            Write <span className="font-bold text-purple-700">"The quick brown fox"</span> on white paper.
            <br/>Ensure the text is clear and well-lit.
        </p>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border-4 border-slate-100">
        {!imgSrc ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }} 
          />
        ) : (
          <div className="relative w-full h-full">
            <img src={imgSrc} alt="Captured" className="w-full h-full object-cover opacity-50 blur-sm" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
               
               {/* LOADING STATE */}
               {analyzing && stabilityScore === null && !error && (
                 <>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-600 border-purple-200 mb-4"></div>
                    <p className="text-white font-bold text-lg drop-shadow-md">Analyzing Geometry...</p>
                 </>
               )}

               {/* RESULT STATE (Shows Stability to User) */}
               {stabilityScore !== null && (
                 <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle size={28} /> 
                        <span className="text-2xl font-black">{stabilityScore}/100</span>
                    </div>
                    <p className="text-sm font-medium opacity-90">Stability Score</p>
                 </div>
               )}

               {/* ERROR STATE */}
               {error && (
                 <div className="bg-red-500 text-white px-6 py-4 rounded-xl flex items-center gap-3">
                   <AlertCircle />
                   <span className="font-bold">{error}</span>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* BUTTONS */}
      {!imgSrc && (
        <div className="flex gap-4 w-full mt-6">
            <button 
              onClick={capture}
              className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition flex justify-center items-center gap-2 shadow-lg"
            >
              <Camera size={24} /> Capture
            </button>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 transition flex justify-center items-center gap-2"
            >
              <Upload size={24} /> Upload
            </button>
        </div>
      )}
    </div>
  );
}