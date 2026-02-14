import { useState } from "react";

const questions = [
  { q: "PRIMARY DIRECTIVE?", options: ["Capital Gain", "Inner Peace", "Raw Power", "Legacy"] },
  { q: "ENCOUNTERING ANOMALY?", options: ["Adapt", "Analyze", "Destroy", "Ignore"] },
  { q: "NATURE OF TRUTH?", options: ["Absolute", "Subjective", "Constructed", "Hidden"] },
  { q: "FINAL DESTINATION?", options: ["Void", "Ascension", "Rebirth", "Control"] }
];

const LifeMCQ = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);

  const progress = ((current + 1) / questions.length) * 100;

  const handleNext = () => {
    if (current === questions.length - 1) {
      onFinish();
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="min-h-[60px]">
        <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Question {current + 1}</span>
        <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-tighter italic">
          {questions[current].q}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {questions[current].options.map((opt, i) => (
          <button
            key={i}
            onClick={handleNext}
            className="group relative flex items-center p-4 bg-gray-900 border border-white/10 hover:border-cyan-500 transition-all"
          >
            <span className="text-xs text-cyan-500 mr-4 font-bold">0{i + 1}</span>
            <span className="text-sm font-bold uppercase group-hover:text-cyan-400 transition-colors">
              {opt}
            </span>
            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500">
              {`>>`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LifeMCQ;