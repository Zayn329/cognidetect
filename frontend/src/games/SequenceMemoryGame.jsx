import React, { useState } from "react";

const GRID_SIZE = 3;
const INITIAL_LIVES = 3;

const getSequenceLength = (level) => 2 + level;

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE));
  }
  return seq;
}

const SequenceMemoryGame = ({ onFinish }) => {
  const [phase, setPhase] = useState("intro"); 
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [sequence, setSequence] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [feedback, setFeedback] = useState(Array(9).fill(null));
  const [roundMessage, setRoundMessage] = useState("");

  const sequenceLength = getSequenceLength(level);

  const startRound = () => {
    const seq = generateSequence(sequenceLength);
    setSequence(seq);
    setInputIndex(0);
    setFeedback(Array(9).fill(null));
    setRoundMessage("");
    playSequence(seq);
  };

  const playSequence = (seq) => {
    setPhase("showing");
    let i = 0;
    const showNext = () => {
      if (i >= seq.length) {
        setActiveCell(null);
        setPhase("input");
        return;
      }
      setActiveCell(seq[i]);
      setTimeout(() => {
        setActiveCell(null);
        i++;
        setTimeout(showNext, 250);
      }, 700);
    };
    showNext();
  };

  const handleCellClick = (index) => {
    if (phase !== "input") return;
    const isCorrect = index === sequence[inputIndex];

    setFeedback((prev) => {
      const copy = [...prev];
      copy[index] = isCorrect ? "correct" : "wrong";
      return copy;
    });

    setPhase("locked");

    setTimeout(() => {
      setFeedback(Array(9).fill(null));
      if (!isCorrect) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          // Calculate Risk: Higher Level = Lower Risk
          const finalRisk = Math.max(0, 100 - (level * 7)); 
          setRoundMessage(`Test finished. Risk Score: ${finalRisk.toFixed(1)}%`);
          setPhase("gameOver");
          setTimeout(() => onFinish(finalRisk), 2500); // Send to App controller
        } else {
          setRoundMessage(`Incorrect. ${newLives} lives left.`);
          setPhase("result");
        }
        return;
      }

      if (inputIndex + 1 === sequence.length) {
        setRoundMessage(`Level ${level} Complete!`);
        setLevel((prev) => prev + 1);
        setPhase("result");
      } else {
        setInputIndex(inputIndex + 1);
        setPhase("input");
      }
    }, 600);
  };

  // UI Helper for styles
  const getCellStyle = (index) => {
    const base = "h-24 w-24 rounded-2xl border border-slate-700 transition-all duration-150 ";
    if (phase === "showing" && index === activeCell) return base + "bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.7)] scale-105";
    if (feedback[index] === "correct") return base + "bg-green-500 scale-105";
    if (feedback[index] === "wrong") return base + "bg-red-500 scale-105";
    return base + "bg-slate-900 hover:bg-slate-800 cursor-pointer";
  };

  if (phase === "intro") {
    return (
      <div className="p-10 bg-slate-900 rounded-3xl text-white shadow-2xl border border-slate-800">
        <h1 className="text-4xl font-bold mb-4">Sequence <span className="text-purple-500">Memory</span></h1>
        <p className="text-slate-400 mb-8">Watch carefully as squares light up. Repeat the pattern to progress.</p>
        <button onClick={() => setPhase("idle")} className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 rounded-full font-bold shadow-lg">Start Memory Test</button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 rounded-3xl text-white border border-slate-800 flex gap-10">
      <div className="flex-1">
        <div className="flex justify-between items-end mb-6">
            <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Current Level</p>
                <p className="text-3xl font-bold">{String(level).padStart(2, '0')}</p>
            </div>
            <p className="text-sm text-slate-400 italic">{roundMessage}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={getCellStyle(i)} onClick={() => handleCellClick(i)} />
          ))}
          {(phase === "idle" || phase === "result") && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-3xl">
              <button onClick={startRound} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-xl">Start Next Round</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-20">
        <p className="text-xs uppercase text-slate-500 mb-4">Lives</p>
        <div className="space-y-3">
          {[...Array(INITIAL_LIVES)].map((_, i) => (
            <div key={i} className={`h-12 w-12 rounded-xl border flex items-center justify-center ${i < lives ? 'bg-red-500 border-red-400' : 'bg-slate-800 border-slate-700'}`}>
              <span className="text-xl">♥</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SequenceMemoryGame;