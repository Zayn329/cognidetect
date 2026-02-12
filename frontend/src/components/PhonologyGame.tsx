import React, { useState, useEffect } from 'react';

// --- GAME DATA (Unchanged) ---
const QUESTIONS = [
  { 
    id: 1, 
    word: "Cat", 
    prompt: "Which word rhymes with Cat?", 
    correct: "Bat", 
    options: [
      { id: 'a', label: "Bat 🦇", isCorrect: true },
      { id: 'b', label: "Dog 🐕", isCorrect: false },
      { id: 'c', label: "Car 🚗", isCorrect: false }
    ]
  },
  { 
    id: 2, 
    word: "Sun", 
    prompt: "Which word rhymes with Sun?", 
    correct: "Run", 
    options: [
      { id: 'a', label: "Fish 🐟", isCorrect: false },
      { id: 'b', label: "Run 🏃", isCorrect: true },
      { id: 'c', label: "Pen 🖊️", isCorrect: false }
    ]
  },
  { 
    id: 3, 
    word: "Ball", 
    prompt: "Which word rhymes with Ball?", 
    correct: "Wall", 
    options: [
      { id: 'a', label: "Wall 🧱", isCorrect: true },
      { id: 'b', label: "Bed 🛏️", isCorrect: false },
      { id: 'c', label: "Cup ☕", isCorrect: false }
    ]
  },
  { 
    id: 4, 
    word: "Tree", 
    prompt: "Which word rhymes with Tree?", 
    correct: "Bee", 
    options: [
      { id: 'a', label: "Book 📖", isCorrect: false },
      { id: 'b', label: "Bee 🐝", isCorrect: true },
      { id: 'c', label: "Chair 🪑", isCorrect: false }
    ]
  },
  { 
    id: 5, 
    word: "Fox", 
    prompt: "Which word rhymes with Fox?", 
    correct: "Box", 
    options: [
      { id: 'a', label: "Hat 🎩", isCorrect: false },
      { id: 'b', label: "Box 📦", isCorrect: true },
      { id: 'c', label: "Pig 🐖", isCorrect: false }
    ]
  }
];

// Updated Prop Interface: onComplete now takes a score (number)
export default function PhonologyGame({ patientName, onComplete }: { patientName: string, onComplete: (score: number) => void }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- 1. SPEECH SYNTHESIS ---
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; 
      utterance.onend = () => {
        setIsSpeaking(false);
        setStartTime(Date.now());
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setStartTime(Date.now());
    }
  };

  useEffect(() => {
    if (currentRound < QUESTIONS.length) {
      const timer = setTimeout(() => {
        speakWord(QUESTIONS[currentRound].prompt);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentRound]);

  // --- 2. HANDLE ANSWER ---
  const handleAnswer = (isCorrect: boolean) => {
    const timeTaken = Date.now() - startTime;
    setReactionTimes([...reactionTimes, timeTaken]);

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
        setScore(newScore); // Update local state
        setFeedback("Correct! ✅");
    } else {
        setFeedback("Incorrect ❌");
    }

    // Auto-advance
    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 < QUESTIONS.length) {
        setCurrentRound(currentRound + 1);
      } else {
        finishGame(newScore, [...reactionTimes, timeTaken]);
      }
    }, 1000);
  };

  // --- 3. FINISH GAME ---
  const finishGame = async (finalScore: number, finalTimes: number[]) => {
    setGameFinished(true);
    // You can also trigger the API call here if you want double-safety
  };

  // --- RENDER ---
  if (gameFinished) {
    return (
      <div className="p-8 text-center border-2 border-green-500 rounded-xl bg-green-50 max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Test Complete! 🎉</h2>
        <p className="text-xl mb-2">Score: {score} / {QUESTIONS.length}</p>
        <p className="text-gray-600 mb-6">Average Reaction Time: {Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length)}ms</p>
        
        {/* 🔥 THIS IS THE FIX 🔥 */}
        <button 
            onClick={() => onComplete(score)} 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
        >
            Continue to Reading Analysis →
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentRound];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Phonological Awareness (Rhyme)</h2>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentRound)/QUESTIONS.length)*100}%` }}></div>
      </div>

      <div className="text-center mb-8">
        <p className="text-lg text-gray-500 mb-2">Listen carefully...</p>
        <h3 className="text-3xl font-bold text-blue-800 mb-4">"{question.word}"</h3>
        <button 
          onClick={() => speakWord(question.prompt)}
          className="text-sm text-blue-500 underline"
          disabled={isSpeaking}
        >
          🔊 Replay Audio
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt.isCorrect)}
            disabled={isSpeaking || feedback !== null}
            className={`
              h-32 text-2xl border-2 rounded-xl transition-all transform hover:scale-105
              ${feedback && opt.isCorrect ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}
            `}
          >
            <div className="text-4xl mb-2">{opt.label.split(' ')[1]}</div>
            <div className="font-bold">{opt.label.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-6 text-center text-xl font-bold animate-pulse text-purple-600">
          {feedback}
        </div>
      )}
    </div>
  );
}