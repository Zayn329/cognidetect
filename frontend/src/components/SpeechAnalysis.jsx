import React, { useState } from 'react';
import API from '../api';
import { Mic, UploadCloud, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
      setSpeechScore(risk_score); // Update global state for the final report
    } catch (err) {
      setError("Analysis failed. Ensure backend is running and model is present.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic className="text-blue-500" /> Step 1: Speech Biomarkers
      </h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
        <input 
          type="file" 
          accept=".wav,.mp3" 
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden" 
          id="audio-upload"
        />
        <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
          <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
          <span className="text-gray-600 font-medium">
            {file ? file.name : "Click to upload Audio (Standard Passage)"}
          </span>
        </label>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className={`mt-4 w-full py-3 rounded-lg font-semibold text-white transition-all
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}
        `}
      >
        {loading ? "Analyzing Jitter, Shimmer & Pauses..." : "Analyze Voice"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {result !== null && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium text-lg">Diagnosis Report</span>
              <span className="text-2xl font-bold text-blue-600">{result.toFixed(1)}% Risk</span>
            </div>
            
            {result > 50 ? (
               <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2 font-bold">
                 <AlertCircle /> HIGH RISK DETECTED
               </div>
            ) : (
               <div className="p-3 bg-green-100 text-green-700 rounded-md flex items-center gap-2 font-bold">
                 <CheckCircle /> LOW RISK / NORMAL
               </div>
            )}
          </div>

          {/* CHUNK-BY-CHUNK DETAILS SECTION */}
          {chunkDetails.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-gray-700"
              >
                <span>See Second-by-Second Analysis</span>
                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showDetails && (
                <div className="max-h-60 overflow-y-auto bg-white">
                  {chunkDetails.map((chunk, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border-b border-gray-100 flex justify-between items-center text-sm ${
                        chunk.is_sick ? 'bg-red-50' : 'bg-green-50'
                      }`}
                    >
                      <span className="font-mono font-medium text-gray-600 w-24">
                        {chunk.time}
                      </span>
                      <span className={`font-bold flex-1 px-4 ${
                        chunk.is_sick ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {chunk.is_sick ? "🔴 " : "🟢 "}{chunk.status}
                      </span>
                      <span className="text-gray-500 font-medium">
                        Confidence: {chunk.confidence.toFixed(1)}%
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