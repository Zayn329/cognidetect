import React, { useState } from 'react';
import API from '../api';
import { Eye, Target, MousePointer2 } from 'lucide-react';

const EyeTracking = ({ eyeScore, setEyeScore }) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const runTest = async (type) => {
    setLoading(true);
    setStatusMsg(`Running ${type} test... Please look at the popup window.`);
    
    try {
      // This request will hang until the Python window closes
      const response = await API.post(`/test-eye/${type}`);
      const { score, details } = response.data;
      
      // Update score: Average if previous exists, else set new
      if (eyeScore !== null) {
        setEyeScore((eyeScore + score) / 2);
      } else {
        setEyeScore(score);
      }
      
      setStatusMsg(`Test Complete. Score: ${score.toFixed(1)}%. ${details}`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Error: Could not connect to eye tracker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Eye className="text-purple-500" /> Step 2: Oculomotor Response
        </h2>
        <p className="text-gray-500 mb-6">Tests will open a separate camera window on your screen.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Focus Test */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center text-center">
            <Target className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-gray-800">Focus Stability</h3>
            <p className="text-xs text-gray-500 mb-4">Keep gaze fixed on red dot (10s)</p>
            <button 
              onClick={() => runTest('focus')} 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Running..." : "Start Focus Test"}
            </button>
          </div>

          {/* Follow Test */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 flex flex-col items-center text-center">
            <MousePointer2 className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-bold text-gray-800">Follow Dot</h3>
            <p className="text-xs text-gray-500 mb-4">Track moving object (10s)</p>
            <button 
              onClick={() => runTest('follow')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? "Running..." : "Start Follow Test"}
            </button>
          </div>

          {/* Score Display */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-gray-600 mb-2">Current Eye Risk</h3>
            <div className="text-4xl font-extrabold text-gray-800">
              {eyeScore !== null ? `${eyeScore.toFixed(1)}%` : "--"}
            </div>
            <p className="text-xs text-gray-400 mt-2">Run tests to calculate</p>
          </div>
        </div>
        
        {statusMsg && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm text-center">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeTracking;