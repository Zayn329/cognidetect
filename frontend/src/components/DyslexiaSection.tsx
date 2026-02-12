// FILE: frontend/components/DyslexiaSection.tsx
'use client';
import React, { useState } from 'react';
import PhonologyGame from './PhonologyGame'; // Ensure this path matches where you put the Game

export default function DyslexiaSection() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dyslexia Screening Module</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">New Feature</span>
      </div>
      
      {!gameStarted ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Phonology Game */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition cursor-pointer" onClick={() => setGameStarted(true)}>
            <div className="text-4xl mb-4">🎧</div>
            <h3 className="text-xl font-bold mb-2 text-blue-900">Phonological Awareness</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Test sound processing speed. Listen to the prompt and match the rhyme.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
              Start Test
            </button>
          </div>

          {/* Placeholders for Future Sessions */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-60">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-500">Rapid Naming (RAN)</h3>
            <p className="text-gray-500 text-sm">Coming in Session 2...</p>
          </div>
        </div>
      ) : (
        <div>
           <button 
             onClick={() => setGameStarted(false)}
             className="mb-4 text-gray-500 underline text-sm"
           >
             ← Back to Dyslexia Menu
           </button>
           {/* Pass the patient name dynamically if you have it, or hardcode for demo */}
           <PhonologyGame 
             patientName="Demo User" 
             onComplete={() => setGameStarted(false)} 
           />
        </div>
      )}
    </div>
  );
}