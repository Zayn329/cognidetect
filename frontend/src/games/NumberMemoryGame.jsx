import React, { useState } from "react";

const MAX_LEVEL = 6;
const digitsForLevel = (level) => 2 + Math.min(level, MAX_LEVEL);
const displayTimeMs = (digits) => (0.5 + 0.5 * digits) * 1000;

const NumberMemoryGame = ({ onFinish }) => {
  const [phase, setPhase] = useState("intro");
  const [level, setLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [wasCorrect, setWasCorrect] = useState(null);

  const startRound = (lvl) => {
    const num = String(Math.floor(Math.random() * (Math.pow(10, digitsForLevel(lvl)) - Math.pow(10, digitsForLevel(lvl)-1))) + Math.pow(10, digitsForLevel(lvl)-1));
    setTargetNumber(num);
    setUserInput("");
    setWasCorrect(null);
    setPhase("showNumber");
    setTimeout(() => setPhase("input"), displayTimeMs(num.length));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const correct = userInput.trim() === targetNumber;
    setWasCorrect(correct);
    setPhase("result");

    if (!correct || level === MAX_LEVEL) {
        // Calculate Risk: Max Level = 0% Risk, Level 1 = ~84% Risk
        const finalRisk = Math.max(0, 100 - (level * 16));
        setTimeout(() => onFinish(finalRisk), 3000); 
    }
  };

  if (phase === "intro") {
    return (
      <div className="p-10 bg-slate-900 rounded-3xl text-white shadow-2xl border border-slate-800 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Number <span className="text-blue-500">Memory</span></h1>
        <p className="text-slate-400 mb-8">Memorize the sequence of digits shown. They will disappear quickly!</p>
        <button onClick={() => startRound(1)} className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-full font-bold shadow-lg transition-all">Start Game</button>
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-900 rounded-3xl text-white shadow-2xl border border-slate-800 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-8 text-slate-400">Level {String(level).padStart(2, '0')}</h2>
      
      {phase === "showNumber" && <div className="text-6xl font-mono tracking-widest animate-pulse">{targetNumber}</div>}

      {phase === "input" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-slate-400">What was the number?</p>
          <input 
            className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl text-3xl text-center focus:ring-2 focus:ring-blue-500 outline-none"
            type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} autoFocus
          />
          <button type="submit" className="bg-blue-600 px-10 py-3 rounded-full font-bold w-full">Submit</button>
        </form>
      )}

      {phase === "result" && (
        <div className="space-y-6">
          <div className={`text-xl font-bold ${wasCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {wasCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase">Correct</p>
                <p className="text-xl font-mono">{targetNumber}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase">Yours</p>
                <p className="text-xl font-mono">{userInput}</p>
            </div>
          </div>
          {wasCorrect && level < MAX_LEVEL ? (
            <button onClick={() => {setLevel(l => l + 1); startRound(level + 1);}} className="bg-blue-600 px-10 py-3 rounded-full font-bold w-full">Next Level</button>
          ) : (
            <div className="p-4 bg-slate-800 rounded-xl text-sm text-blue-300">Test Complete. Preparing Multimodal modules...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NumberMemoryGame;