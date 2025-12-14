import React, { useState } from "react";
import { updateCaseWithGuess } from "./../../src/Supabase/cases";
import { Gavel, Fingerprint, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";

const Accusation = ({ caseData, onResetGame, onSuccessfulSolve }) => {
  const [accusedName, setAccusedName] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [murdererName, setMurdererName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accusedName.trim()) return;
    setSubmitting(true);
    
    // Find the actual murderer
    const murderer = caseData.suspects.find(suspect => suspect.is_murderer);
    setMurdererName(murderer ? murderer.name : "Unknown");
    
    // Check if accusation is correct (case insensitive comparison)
    const isMatch = murderer && 
      accusedName.toLowerCase().includes(murderer.name.toLowerCase());
      
    await updateCaseWithGuess(caseData.id, {
      user_guess: accusedName,
      guess_correct: isMatch
    });
    
    setIsCorrect(isMatch);
    setShowResult(true);
    setSubmitting(false);
    
    // If the accusation was correct, notify the parent component
    if (isMatch && onSuccessfulSolve) {
      onSuccessfulSolve();
    }
  };

  const handleNextGame = () => {
    setAccusedName("");
    setShowResult(false);
    setIsCorrect(false);
    if (onResetGame) {
      onResetGame();
    }
  };

  if (showResult) {
    return (
      <div className={`relative overflow-hidden rounded-lg p-6 text-center border transition-all duration-500 ${
      isCorrect 
          ? "bg-green-900/20 border-green-500/50 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]" 
          : "bg-red-900/20 border-red-500/50 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]"
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        {isCorrect ? (
          <div className="relative z-10 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-green-400 uppercase tracking-widest mb-2">Case Closed</h2>
            <p className="text-slate-300 mb-6 text-sm">
              Excellent deduction, Detective. <br/>
              <span className="text-green-300 font-bold">{murdererName}</span> has been apprehended.
            </p>
          </div>
        ) : (
          <div className="relative z-10 animate-in shake duration-300">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-red-400 uppercase tracking-widest mb-2">Suspect Escaped</h2>
            <p className="text-slate-300 mb-6 text-sm">
              Your deduction was incorrect. <br/>
              The true culprit was <span className="text-red-300 font-bold">{murdererName}</span>.
            </p>
          </div>
        )}
        
        <button
          onClick={handleNextGame}
          className={`px-6 py-2 rounded font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 mx-auto ${
            isCorrect 
             ? "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/25" 
             : "bg-slate-700 hover:bg-slate-600 text-white hover:text-red-200"
          }`}
        >
          {isCorrect ? (
            <>Next Assignment <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Reopen New Case <RotateCcw className="w-4 h-4" /></>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-1">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Fingerprint className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              id="accusedName"
              placeholder="Enter suspect name..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
              value={accusedName}
              onChange={(e) => setAccusedName(e.target.value)}
              required
              autoComplete="off"
            />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 border border-purple-500/20"
        >
          {submitting ? (
             <span className="animate-pulse">Verifying DNA...</span>
          ) : (
             <>
                <Gavel className="w-4 h-4" /> Submit Verdict
             </>
          )}
        </button>
      </form>
    </div>
  );
};
    
export default Accusation;