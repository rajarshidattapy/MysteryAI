import React, { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { Gavel, Fingerprint, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Loader2, Trophy } from "lucide-react";
import { DEAD_DROP_REGISTRY_ADDRESS, DEAD_DROP_REGISTRY_ABI } from "../monad/deadDropRegistry";
import { monadTestnet } from "../../waqmi.config";
import { getPointsForDifficulty, getDifficultyLabel } from "../utils/difficulty";

// Helper function to normalize strings for blockchain matching
// CRITICAL: Solidity hashing is case-sensitive and whitespace-sensitive
const normalizeForBlockchain = (str) => {
  return str
    .trim()                    // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ')      // Normalize multiple spaces to single space
    .toLowerCase();            // Convert to lowercase for case-insensitive matching
};

const Accusation = ({ caseData, onResetGame, onSuccessfulSolve, mysteryId, salt }) => {
  const [accusedName, setAccusedName] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [murdererName, setMurdererName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: monadTestnet.id });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accusedName.trim()) {
      setErrorMessage("Please enter a suspect name");
      return;
    }

    if (!isConnected || !walletClient || !mysteryId || !salt) {
      setErrorMessage("⚠️ Wallet not connected or mystery not initialized");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      // Find the actual murderer for UI display
      const murderer = caseData.suspects.find(suspect => suspect.is_murderer);
      setMurdererName(murderer ? murderer.name : "Unknown");

      // Normalize the input to match blockchain expectations
      // This handles: "John" vs "john" vs " John " vs "JOHN"
      const normalizedCulprit = normalizeForBlockchain(accusedName);

      console.log("🔐 Calling solveMystery on-chain...", {
        mysteryId,
        originalInput: accusedName,
        normalizedCulprit,
        salt
      });

      const hash = await walletClient.writeContract({
        address: DEAD_DROP_REGISTRY_ADDRESS,
        abi: DEAD_DROP_REGISTRY_ABI,
        functionName: 'solveMystery',
        args: [BigInt(mysteryId), normalizedCulprit, salt]
      });

      console.log("📤 Transaction sent:", hash);
      setTxHash(hash);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log("✅ Transaction confirmed:", receipt);

      // If we got here, transaction succeeded = correct answer!
      setIsCorrect(true);
      setShowResult(true);

      // Notify parent component
      if (onSuccessfulSolve) {
        onSuccessfulSolve();
      }

    } catch (error) {
      console.error("❌ Error solving mystery:", error);

      // Parse different error types
      const errorMsg = error.message || error.toString();

      // Check for specific revert reasons
      if (errorMsg.includes("Incorrect solution") ||
          errorMsg.includes("execution reverted") ||
          errorMsg.includes("reverted")) {

        console.log("🔍 Wrong answer - transaction reverted on-chain");
        setIsCorrect(false);
        setShowResult(true);

      } else if (errorMsg.includes("user rejected") ||
                 errorMsg.includes("User denied")) {

        setErrorMessage("❌ Transaction cancelled by user");

      } else if (errorMsg.includes("insufficient funds")) {

        setErrorMessage("❌ Insufficient funds for gas");

      } else if (errorMsg.includes("network")) {

        setErrorMessage("❌ Network error - please check connection");

      } else {

        // Generic error
        setErrorMessage("❌ Transaction failed. Please try again.");
        console.error("Unhandled error:", error);
      }

    } finally {
      setSubmitting(false);
    }
  };

  const handleNextGame = () => {
    setAccusedName("");
    setShowResult(false);
    setIsCorrect(false);
    setTxHash(null);
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
            <h2 className="text-2xl font-black text-green-400 uppercase tracking-widest mb-2">Mystery Solved</h2>
            <p className="text-slate-300 mb-2 text-sm">
              Excellent deduction, Detective. <br/>
              <span className="text-green-300 font-bold">{murdererName}</span> has been apprehended.
            </p>

            {/* Points Awarded */}
            {caseData?.difficulty !== undefined && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">
                  +{getPointsForDifficulty(caseData.difficulty)} points
                </span>
                <span className="text-slate-500 text-xs">
                  ({getDifficultyLabel(caseData.difficulty)})
                </span>
              </div>
            )}

            {txHash && (
              <p className="text-xs text-slate-500 mb-4 font-mono break-all">
                Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            )}
          </div>
        ) : (
          <div className="relative z-10 animate-in shake duration-300">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-red-400 uppercase tracking-widest mb-2">Wrong Guess</h2>
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
            <>Next Mystery <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>New Mystery <RotateCcw className="w-4 h-4" /></>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">{errorMessage}</p>
        </div>
      )}

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
              disabled={submitting}
            />
        </div>
        
        <button
          type="submit"
          disabled={submitting || !isConnected}
          className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 border border-purple-500/20"
        >
          {submitting ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               <span>Verifying On-Chain...</span>
             </>
          ) : !isConnected ? (
             <span>Connect Wallet First</span>
          ) : (
             <>
                <Gavel className="w-4 h-4" /> Submit Accusation
             </>
          )}
        </button>
      </form>
    </div>
  );
};
    
export default Accusation;