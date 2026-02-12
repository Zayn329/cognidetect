import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Checks if you use router
import PhonologyGame from './PhonologyGame'; // Import your game component

const DyslexiaTestPage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate(); // Hook to change pages

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dyslexia Screening</h1>
        <button 
          onClick={() => navigate('/')} // Go back to Dashboard
          className="text-slate-500 hover:text-slate-800 font-bold underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* CONTENT */}
      <div className="w-full max-w-4xl">
        {!gameStarted ? (
          <div className="bg-white p-10 rounded-2xl shadow-xl border text-center">
            <div className="text-6xl mb-6">🎧</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Phonological Awareness</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-lg mx-auto">
              This test measures how quickly you process sounds. 
              <br/>You will hear a word (e.g., "Cat") and must click the image that rhymes with it (e.g., "Bat").
            </p>
            <button 
              onClick={() => setGameStarted(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition shadow-lg transform hover:scale-105"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <PhonologyGame 
            patientName="Muzzaffar Pawale" // You can make this dynamic later
            onComplete={() => {
              alert("Test Complete! Results saved.");
              navigate('/'); // Return to dashboard after finishing
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default DyslexiaTestPage;