import React, { useState, useEffect, useRef } from "react";
import Accusation from "./accusation";
import { useCase } from "./useCase";
import { storeCaseInFirestore, updateCaseChat } from "../../Firebase/storeCase.jsx";
import Timer from "./timer.jsx";
import UserStats from "../Stats/UserStats";
import { auth, db, onAuthStateChange } from '../../Firebase/userAuth';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

import { ethers } from "ethers";
import { storeEmbeddingsForCase } from "./../../Firebase/storeEmbeddings";
import { cosineSimilarity } from "../../RAG/cosineUtils";
import { getRelevantContext } from "./../../RAG/getRelaventContext"; 
import { getEmbeddingFromHF } from "./../../RAG/generateEmbeddingHF";
import { queryAllCaseSummaries } from "./../../RAG/queryAllCaseSummaries";
import { storeOverviewEmbedding } from "../../RAG/storeOverviewEmbedding";
import WalletLeaderboard from "../Stats/WalletLeaderboard.jsx";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { MYSTERY_PROOF_ABI, MYSTERY_PROOF_ADDRESS } from "../monad/proofContract.js";

// 🎨 Icons
import { 
  Play, MessageSquare, FileText, Users, 
  Siren, X, Clock, Send, ShieldAlert, Cpu, 
  Terminal, Database, FlaskConical, Lightbulb, Eye, Fingerprint, MapPin
} from "lucide-react";

const API_KEY = "AIzaSyA63dd1fVVukrf0mvmfFo8DoRH5vpzigPs";

const GameStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewing, setViewing] = useState("suspect");
  const [showModal, setShowModal] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null); 
  
  const { caseData, setCaseData } = useCase();
  const [startTime, setStartTime] = useState(Date.now());
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [confirmQuitModal, setConfirmQuitModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  const {address, isConnected} = useAccount();
  const chainId = useChainId();
  const {data:walletClient} = useWalletClient();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // --- FIXED: Reliable Avatar API (DiceBear) ---
  const getGenderBasedAvatar = (username, gender) => {
    const seed = username ? username.replace(/\s+/g, '') : 'unknown';
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=e5e7eb,b6e3f4,c0aede&radius=50&scale=120`;
  };

  // --- Auto Scroll Chat ---
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [caseData, showModal, chatLoading]);

  // --- Auth & Wallet Logic ---
  const createWalletProof = async (won, timeTaken, caseId) => {
    if (!isConnected || !walletClient || !address) {
      console.log("⏭️ No wallet connected for proof generation");
      return null;
    }
    
    const message = `MysteryAI proof\ncaseId: ${caseId}\nsolved: ${won}\ntimeTaken: ${timeTaken}\nchainId: ${chainId}`;
    
    try {
      console.log("🔐 Signing wallet proof...", { address, chainId, caseId });
      const signature = await walletClient.signMessage({ account: address, message });
      console.log("✅ Wallet proof signed successfully");
      return { walletAddress: address, chainId, message, signature };
    } catch (err) {
      console.error('❌ Error signing wallet proof:', err);
      return null;
    }
  };

  const sendOnChainProof = async (result, timeTaken) => {
    try {
      const MONAD_TESTNET_ID = 10143; 
      
      if (!isConnected || !walletClient) {
        console.log("⏭️ Wallet not connected – skipping on-chain proof");
        return;
      }
      
      if (chainId !== MONAD_TESTNET_ID) {
        console.log("⏭️ Not on Monad Testnet – skipping on-chain proof");
        return;
      }
      
      if (!caseData?.id) {
        console.log("⏭️ No case id yet – skipping on-chain proof");
        return;
      }
      
      console.log("📤 Sending on-chain proof...", { caseId: caseData.id, timeTaken, solved: result });
      
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MYSTERY_PROOF_ADDRESS, MYSTERY_PROOF_ABI, signer);
      
      const tx = await contract.recordGame(caseData.id, timeTaken, result);
      console.log("✅ Tx sent, hash =", tx.hash);
      
      const receipt = await tx.wait();
      console.log("🎉 Tx mined:", receipt);
    } catch (err) {
      console.error("❌ Error sending on-chain proof:", err);
    }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setCurrentUsername(userData.username);
      console.log("👤 Current username loaded:", userData.username);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
      setAuthChecked(true);
      console.log("🔐 Auth state changed:", user ? `User: ${user.uid}` : "No user");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecked) return; 
    if (!firebaseUser && !isConnected) {
      console.warn("⚠️ No authentication found, redirecting to /auth");
      window.location.href = '/auth';
    }
  }, [authChecked, firebaseUser, isConnected]);

  const saveGameStats = async (result, timeTaken, proof) => {
    let userId = auth.currentUser ? auth.currentUser.uid : (address ? `wallet:${address.toLowerCase()}` : null);
    
    if (!userId) {
      console.warn("⚠️ No auth user or wallet connected, skipping stats save");
      return;
    }

    console.log("💾 Saving game stats...", { userId, result, timeTaken, caseId: caseData?.id });

    try {
      await addDoc(collection(db, "userGames"), {
        userId,
        walletAddress: address ? address.toLowerCase() : null,
        caseTitle: caseData?.case_title || "Mystery Case",
        solved: result,
        timeTaken: timeTaken,
        timestamp: serverTimestamp(),
        caseId: caseData?.id || null,
        walletProofSignature: proof?.signature || null,
        walletProofMessage: proof?.message || null,
        walletProofChainId: proof?.chainId || null,
      });

      if (auth.currentUser) {
        const userRef = doc(db, "userDetails", auth.currentUser.uid);
        await updateDoc(userRef, {
          "stats.gamesPlayed": increment(1),
          "stats.wins": increment(result ? 1 : 0),
          "stats.totalSolveTime": increment(timeTaken),
        });
      }
      
      console.log("✅ Game stats saved successfully");
    } catch (error) {
      console.error("❌ Error saving game stats:", error);
    }
  };

  // --- Game Control Logic ---
  const handleQuit = () => {
    console.log("⚠️ Quit requested");
    setConfirmQuitModal(true);
  };
  
  const handleTimerEnd = () => {
    console.log("⏰ Timer ended");
    alert("Time's up! Game over.");
    handleGameEnd(false);
  };
  
  const handleTimePause = () => {
    console.log("⏸️ Timer paused");
    setIsTimerPaused(true);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    setTotalTimeTaken(prev => prev + elapsedTime);
  };

  const handleTimeResume = () => {
    console.log("▶️ Timer resumed");
    setIsTimerPaused(false);
    setStartTime(Date.now());
  };
  
  const handleGameEnd = async (won, finalTime) => {
    const gameTime = finalTime || (isTimerPaused 
      ? totalTimeTaken 
      : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000));

    console.log("🏁 Game ending...", { won, gameTime });

    const proof = caseData?.id ? await createWalletProof(won, gameTime, caseData.id) : null;
    await saveGameStats(won, gameTime, proof);
    await sendOnChainProof(won, gameTime);
    
    setCaseData(null);
    setSelectedIndex(null);
    setShowModal(false);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
    setIsTimerPaused(false);
    
    console.log("✅ Game ended and reset");
  };
  
  const handleSuccessfulSolve = (time) => {
    console.log("🎉 Case solved successfully!");
    handleGameEnd(true, time);
  };

  // --- Case Generation / Chat ---
  const randomSettings = ["abandoned amusement park", "deep sea research lab", "underground speakeasy", "snowbound mountain lodge", "suburban block party", "VR gaming expo", "desert music festival", "private jet", "haunted mansion"];
  const randomEvents = ["mask reveal ceremony", "talent show", "blizzard lockdown", "power outage", "silent auction", "fire drill", "art unveiling", "company IPO party"];
  const randomMurderMethods = ["poisoned drink", "electrocuted in bath", "stage light rig collapse", "sabotaged harness", "crossbow from behind curtain", "snake venom", "laced perfume"];
  
  const seed = Date.now();
  
  const prompt = JSON.stringify({
    instructions: "You are an expert mystery storyteller. Generate a complex and surprising murder mystery in a unique setting.",
    structure: {
      setting: randomSettings[Math.floor(Math.random() * randomSettings.length)],
      event: randomEvents[Math.floor(Math.random() * randomEvents.length)],
      murder_method: randomMurderMethods[Math.floor(Math.random() * randomMurderMethods.length)],
      case_title: "Generate a short creative title.",
      case_overview: "Write an intriguing 3–5 line summary using the setting, event, and method.",
      suspects: "Include 2–4 suspects. Only one is the murderer and is lying. Each must have unique motives, personalities, and styles.",
      witnesses: "Include 0–2 witnesses. They are always truthful but speak vaguely.",
      variation: "Do not repeat names, motives, or structure from prior examples."
    },
    output_format: "{ \"case_title\": \"...\", \"case_overview\": \"...\", \"difficulty\": \"...\", \"suspects\": [ { \"name\": \"...\", \"gender\": \"...\", \"age\": ..., \"clothing\": \"...\", \"personality\": \"...\", \"background\": \"...\", \"alibi\": \"...\", \"is_murderer\": true/false } ], \"witnesses\": [ { \"name\": \"...\", \"description\": \"age, profession, and location during the crime\", \"observation\": \"What they saw or heard, vague but truthful\", \"note\": \"Contextual detail that subtly supports or contradicts a suspect's alibi\" } ] }",
    difficulty: "Medium",
    randomness: "Use a timestamp-based seed to increase randomness.",
    seed: seed
  });

  const extractSummaryForEmbedding = (caseData) => {
    return `${caseData.case_title}. ${caseData.case_overview}`.replace(/\n/g, " ").replace(/"/g, "'").replace(/\\+/g, " ").slice(0, 512);
  };

  const callGemini = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;
    let found = false;
    let finalParsed = null;
    let summary = null;
    let newEmbedding = null;
    
    console.log("🚀 Starting case generation...");
    
    while (attempts < 5 && !found) {
      attempts++;
      console.log(`📝 Attempt ${attempts}/5`);
      
      try {
        console.log("🔄 Calling Gemini API...");
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`❌ Gemini API HTTP error ${res.status}:`, errorText);
          
          if (res.status === 429) {
            console.warn("⚠️ Rate limited, waiting 2 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          continue;
        }
      
        const data = await res.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
        if (!text) {
          console.error("❌ No text received from Gemini API:", data);
          continue;
        }
        
        if (data.error) {
          console.error("❌ Gemini API error:", data.error);
          continue;
        }
      
        text = text.replace(/```json|```/g, "").trim();
        text = text.replace(/^\s*[\r\n]/gm, "").trim();
        
        let parsed;
        try {
          parsed = JSON.parse(text);
          console.log("✅ Successfully parsed JSON response");
        } catch (parseError) {
          console.error("❌ Failed to parse JSON response:", parseError);
          console.error("Raw text:", text.substring(0, 200) + "...");
          continue;
        }
        
        // Validate the parsed data has required fields
        if (!parsed.case_title || !parsed.case_overview || !parsed.suspects) {
          console.error("❌ Invalid case data structure:", parsed);
          continue;
        }
        
        console.log("✅ Case parsed successfully:", parsed.case_title);
        summary = extractSummaryForEmbedding(parsed);
        console.log("📊 Generated summary for embedding:", summary.substring(0, 100) + "...");
        
        newEmbedding = await getEmbeddingFromHF(summary);
        
        // Check if embedding generation failed
        if (!newEmbedding) {
          console.error("❌ Failed to generate embedding for summary");
          console.warn("⚠️ Proceeding without embedding similarity check");
          found = true;
          finalParsed = parsed;
          finalParsed.embedding = null;
          break;
        }
        
        console.log("✅ Embedding generated successfully");
        
        // Get all past embeddings
        const existingSummaries = await queryAllCaseSummaries();
        console.log(`📚 Found ${existingSummaries.length} existing case summaries`);
        
        // If no existing summaries, this is the first case
        if (existingSummaries.length === 0) {
          console.log("🎉 First case ever - no similarity check needed");
          found = true;
          finalParsed = parsed;
          finalParsed.embedding = newEmbedding;
        } else {
          const tooSimilar = existingSummaries.some((entry) => {
            // Skip entries without valid embeddings
            if (!entry.embedding || !Array.isArray(entry.embedding)) {
              console.warn("⚠️ Skipping entry with invalid embedding:", entry.summary?.substring(0, 50));
              return false;
            }
            
            const sim = cosineSimilarity(newEmbedding, entry.embedding);
            console.log(`📊 Similarity with "${entry.summary?.substring(0, 50)}...": ${sim.toFixed(4)}`);
            return sim > 0.85;
          });
        
          if (!tooSimilar) {
            found = true;
            finalParsed = parsed;
            finalParsed.embedding = newEmbedding;
            console.log("✅ Found unique case after similarity check");
          } else {
            console.log("⚠️ Case too similar to existing cases, trying again...");
          }
        }
      } catch (err) {
        console.error(`❌ Error on attempt ${attempts}:`, err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack
        });
      }
    }
    
    if (!finalParsed) {
      console.error("❌ All attempts failed, generating fallback case");
      
      // Generate a simple fallback case
      const fallbackCase = {
        case_title: "The Mysterious Disappearance",
        case_overview: "A classic whodunit in a cozy library where nothing is as it seems.",
        difficulty: "Easy",
        suspects: [
          {
            name: "Professor Smith",
            gender: "male",
            age: 45,
            clothing: "Tweed jacket",
            personality: "Intellectual and reserved",
            background: "University professor",
            alibi: "Was grading papers in his office",
            is_murderer: false,
            chat: []
          },
          {
            name: "Librarian Jones",
            gender: "female", 
            age: 38,
            clothing: "Professional attire",
            personality: "Organized and helpful",
            background: "Head librarian",
            alibi: "Was helping a student find books",
            is_murderer: true,
            chat: []
          }
        ],
        witnesses: [
          {
            name: "Student Wilson",
            description: "20, student, studying at table near the incident",
            observation: "Heard a loud noise and saw someone running",
            note: "The noise sounded like something heavy falling",
            chat: []
          }
        ],
        embedding: null
      };
      
      finalParsed = fallbackCase;
      console.log("✅ Fallback case generated successfully");
    }
    
    const userId = currentUsername || null;
    finalParsed.suspects = finalParsed.suspects.map((s) => ({ ...s, chat: [] }));
    finalParsed.witnesses = finalParsed.witnesses?.map((w) => ({ ...w, chat: [] })) || [];
    
    try {
      console.log("💾 Storing case in Firestore...");
      
      const ownerId = auth.currentUser
        ? `firebase:${auth.currentUser.uid}`
        : address
        ? `wallet:${address.toLowerCase()}`
        : null;

      console.log("👤 Owner ID:", ownerId);

      const docId = await storeCaseInFirestore(finalParsed, userId);
      
      if (!docId) {
        console.error("❌ No document ID returned from storeCaseInFirestore");
        throw new Error("Failed to store case - no document ID");
      }
      
      finalParsed.id = docId;
      console.log("✅ Case stored with ID:", docId);
      
      // Only store embeddings if they were generated successfully
      if (summary && newEmbedding) {
        console.log("💾 Storing embeddings...");
        await storeOverviewEmbedding(docId, summary, newEmbedding);
        await storeEmbeddingsForCase(finalParsed, docId);
        console.log("✅ Embeddings stored successfully");
      } else {
        console.warn("⚠️ Skipping embedding storage due to generation failure");
      }
    } catch (error) {
      console.error("❌ Error storing case:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        caseTitle: finalParsed.case_title
      });
    }

    setCaseData(finalParsed);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
    setIsTimerPaused(false);
    setLoading(false);
    
    console.log("🎉 Case generation completed successfully!");
    console.log("📋 Final case data:", {
      id: finalParsed.id,
      title: finalParsed.case_title,
      suspects: finalParsed.suspects.length,
      witnesses: finalParsed.witnesses.length
    });
  };

  const generateSimpleCase = () => {
    console.log("🧪 Generating test case...");
    callGemini(); 
  };

  const sendMessageToCharacter = async () => {
    if (!currentInput.trim()) {
      console.warn("⚠️ Empty message, skipping send");
      return;
    }
    
    console.log("💬 Sending message to character:", currentInput);
    
    const updated = { ...caseData };
    const key = viewing === "suspect" ? "suspects" : "witnesses";
    const character = updated[key][selectedIndex];
    
    character.chat.push({ role: "user", content: currentInput });
    setCaseData(updated);
    setChatLoading(true);

    const dialog = character.chat.map(msg => 
      msg.role === "user" 
        ? `Investigator: ${msg.content}` 
        : `${character.name}: ${msg.content}`
    ).join("\n");
    
    console.log("🔍 Getting relevant context...");
    let context = await getRelevantContext(caseData.id, currentInput);
    console.log("📚 Context retrieved:", context ? context.substring(0, 100) + "..." : "None");
    
    const finalPrompt = `${viewing === "suspect" ? `You are ${character.name}, a suspect.` : `You are ${character.name}, a witness.`} Context: ${context || "None"}. Chat: ${dialog}. Respond as ${character.name}, concise (max 35 words). If murderer, lie convincingly. Include 1 generic detective question hint separated by @.`;

    try {
      console.log("🤖 Calling Gemini for character response...");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );
      
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (reply) {
        console.log("✅ Character response received:", reply.substring(0, 100) + "...");
        character.chat.push({ role: "model", parts: reply.split("@") });
        setCaseData({ ...updated });
        
        if (caseData.id) {
          console.log("💾 Updating chat in Firestore...");
          await updateCaseChat(caseData.id, { 
            suspects: updated.suspects, 
            witnesses: updated.witnesses 
          });
          console.log("✅ Chat updated in Firestore");
        }
      } else {
        console.error("❌ No reply from character AI");
      }
    } catch (e) { 
      console.error("❌ Error in character chat:", e);
    }
    
    setCurrentInput(""); 
    setChatLoading(false);
  };
  
  const handleResetGame = () => {
    console.log("🔄 Resetting game...");
    setCaseData(null);
    setSelectedIndex(null);
    setShowModal(false);
    callGemini(); 
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-slate-200 font-mono relative overflow-x-hidden">
        {/* add once near the top of the returned JSX */}
<style jsx>{`
  /* Reusable custom scrollbar to match Archives panel */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(168, 85, 247, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 85, 247, 0.5);
  }
`}</style>

        {/* Background */}
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
        <div className="fixed top-0 left-0 w-full h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none z-0"></div>

        <div className="relative z-100 p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto">
            
            {/* 1. LOBBY STATE (No active case) */}
            {!caseData ? (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-full border border-purple-500/30 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <Fingerprint className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                             CASE COMMAND
                        </h1>
                        <p className="text-slate-400 uppercase tracking-widest text-xs">Monad Bureau of Investigation</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Action Panel */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                            <div className="bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <h2 className="text-xl font-bold text-white mb-2 relative z-10">New Assignment</h2>
                                <p className="text-slate-400 text-sm mb-6 relative z-10">Generate a procedural murder mystery seeded by AI.</p>
                                
                                <button
                                    onClick={callGemini}
                                    disabled={loading}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_4px_20px_-5px_rgba(147,51,234,0.5)] hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <> <Play className="w-5 h-5 fill-current" /> START INVESTIGATION </>
                                    )}
                                </button>
                                
                                <div className="mt-8 flex justify-center gap-2 relative z-10 opacity-50 hover:opacity-100 transition-opacity">
                                     <button onClick={generateSimpleCase} className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 px-2 py-1 bg-black/20 rounded">
                                        <FlaskConical className="w-3 h-3" /> Test Mode
                                     </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats - Left */}
                        <div className="lg:col-span-1 order-2 lg:order-1 h-80">
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 h-full overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 mb-4 text-purple-400 opacity-80">
            <Database className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Archives</h3>
        </div>
        <div 
            className="h-[calc(100%-2rem)] overflow-y-auto"
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent'
            }}
        >
            <style jsx>{`
                div::-webkit-scrollbar {
                    width: 6px;
                }
                div::-webkit-scrollbar-track {
                    background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.3);
                    border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.5);
                }
            `}</style>
            <UserStats />
        </div>
    </div>
</div>

                        


                        {/* Leaderboard - Right */}
                        <div className="lg:col-span-1 order-3 h-80">
                           <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 h-full overflow-hidden shadow-lg">
                                <div className="flex items-center gap-2 mb-4 text-purple-400 opacity-80">
                                    <Users className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Top Detectives</h3>
                               </div>
                               <div className="h-[calc(100%-2rem)]">
                                   <WalletLeaderboard />
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* 2. ACTIVE GAME DASHBOARD (FIXED LAYOUT) */
                <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col gap-6">
                    
                    {/* HUD BAR */}
                    <div className="sticky top-20 z-200 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl mb-12">
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-4 px-5 py-3 bg-black/40 rounded-lg border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-red-400 tracking-widest uppercase">Live</span>
                                </div>
                                <div className="w-px h-5 bg-slate-700"></div>
                                <div className="min-w-[120px]">
                                    <Timer onTimerEnd={handleTimerEnd} onTimePause={handleTimePause} onTimeResume={handleTimeResume} />
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <Terminal className="w-4 h-4" />
                                <span>CASE_ID: <span className="text-purple-400">{caseData.id?.slice(0,8).toUpperCase()}</span></span>
                            </div>
                        </div>
                        <button 
                            onClick={handleQuit}
                            className="px-5 py-3 bg-red-950/30 hover:bg-red-900/50 text-red-200 text-xs font-bold uppercase tracking-wide rounded-lg border border-red-500/20 hover:border-red-500 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <X className="w-4 h-4" /> Abort Mission
                        </button>
                    </div>

                    {/* DASHBOARD GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* LEFT COLUMN: INTEL (Sticky) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-40 flex flex-col gap-6 h-fit">
                            
                            {/* Case File */}
                            <div className="bg-slate-900/80 border-l-4 border-purple-500 rounded-r-xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText className="w-32 h-32 rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                            <MapPin className="w-3 h-3" /> Crime Scene Data
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${caseData.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                            {caseData.difficulty} Level
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight mb-4 drop-shadow-md">{caseData.case_title}</h2>
                                    <div className="text-slate-300 text-sm leading-relaxed border-t border-slate-700/50 pt-4 font-medium">
                                        {caseData.case_overview}
                                    </div>
                                </div>
                            </div>

                            {/* Verdict Console */}
                            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                <div className="bg-slate-950/50 p-3 border-b border-slate-700/50 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Final Verdict Terminal</span>
                                </div>
                                <div className="p-4">
                                    <Accusation 
                                        caseData={caseData} 
                                        onResetGame={handleResetGame} 
                                        onSuccessfulSolve={(totalTime) => {
                                            const time = isTimerPaused ? totalTimeTaken : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000);
                                            handleSuccessfulSolve(time);
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: INVESTIGATION (Scrollable) */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            
                            {/* Suspects Section */}
                            <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl p-6">
                                <h3 className="text-purple-400 text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="p-1 bg-purple-500/10 rounded"><Users className="w-5 h-5" /></span>
                                    Primary Suspects <span className="text-slate-600 font-normal normal-case ml-auto text-xs">(Tap to Interrogate)</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {caseData.suspects.map((suspect, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedIndex(idx); setViewing("suspect"); setShowModal(true); }}
                                            className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-xl p-4 transition-all text-left flex items-center gap-4 shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-slate-600 group-hover:border-purple-400 shadow-inner">
                                                <img src={getGenderBasedAvatar(suspect.name.replace(/\s+/g, ''), suspect.gender)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white font-bold text-base truncate group-hover:text-purple-300">{suspect.name}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-1 font-bold">Suspect #{idx+1}</div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${suspect.chat.length > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                                    {suspect.chat.length > 0 ? 'Interrogated' : 'Pending'}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Witnesses Section */}
                            <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl p-6">
                                <h3 className="text-blue-400 text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="p-1 bg-blue-500/10 rounded"><Eye className="w-5 h-5" /></span>
                                    Key Witnesses
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {caseData.witnesses.map((witness, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedIndex(idx); setViewing("witness"); setShowModal(true); }}
                                            className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-xl p-4 transition-all text-left flex items-center gap-4 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-slate-600 group-hover:border-blue-400 shadow-inner">
                                                <img src={getGenderBasedAvatar(witness.name.replace(/\s+/g, ''), witness.gender)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white font-bold text-base truncate group-hover:text-blue-300">{witness.name}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-1 font-bold">Witness</div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${witness.chat.length > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                                    {witness.chat.length > 0 ? 'Interviewed' : 'Pending'}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL (Chat) --- */}
            {showModal && selectedIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 z-[110] p-2 bg-slate-800/80 hover:bg-red-600/90 text-slate-300 hover:text-white rounded-full border border-slate-700 hover:border-red-500/50 transition-all shadow-xl"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {(() => {
                        const isSuspect = viewing === "suspect";
                        const character = caseData[isSuspect ? "suspects" : "witnesses"][selectedIndex];
                        const accent = isSuspect ? "purple" : "blue";
                        
                        return (
                            <div className={`bg-slate-950 w-full max-w-5xl h-[85vh] rounded-2xl border border-${accent}-500/30 shadow-2xl flex flex-col md:flex-row overflow-hidden relative`}>
                                <div className="md:w-72 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-full flex-shrink-0">
                                    <div className="p-6 border-b border-slate-800/50 bg-slate-900/80">
                                        <div className={`w-24 h-24 rounded-full border-4 border-${accent}-500/20 overflow-hidden mb-4 mx-auto shadow-lg bg-slate-200`}>
                                            <img src={getGenderBasedAvatar(character.name.replace(/\s+/g, ''), character.gender)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white text-center mb-1 leading-none">{character.name}</h2>
                                        <div className="flex justify-center mt-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-${accent}-500/10 text-${accent}-400 border border-${accent}-500/20`}>
                                                {isSuspect ? "Primary Suspect" : "Key Witness"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

                                        {Object.entries(character).filter(([k]) => !["chat", "name", "is_murderer", "embedding"].includes(k)).map(([k, v]) => (
                                            <div key={k} className="group">
                                                <span className="block text-slate-500 uppercase font-bold text-[10px] tracking-wider mb-1 group-hover:text-${accent}-400 transition-colors">{k}</span>
                                                <span className="text-sm text-slate-300 leading-snug block">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                                        <button onClick={() => setShowModal(false)} className="w-full py-3 bg-slate-800 hover:bg-red-900/20 border border-slate-700 hover:border-red-500/30 rounded-lg text-xs text-slate-400 hover:text-red-400 uppercase font-bold transition-all flex items-center justify-center gap-2">
                                            <X className="w-4 h-4" /> Close File
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col bg-black/20 relative min-w-0">
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

                                        {character.chat.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                                <MessageSquare className="w-12 h-12 mb-2" />
                                                <span className="text-sm font-mono uppercase tracking-widest">Secure Line Connected</span>
                                            </div>
                                        )}
                                        {character.chat.map((msg, i) => (
                                            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                                                    msg.role === "user" ? `bg-${accent}-600 text-white rounded-br-none` : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                                                }`}>
                                                    {msg.role === "model" && msg.parts ? (
                                                        <><div>{msg.parts[0]}</div>{msg.parts[1] && <div className="mt-3 pt-2 border-t border-white/10 flex gap-2 items-start"><Lightbulb className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" /><span className="text-xs text-yellow-500/90 italic">{msg.parts[1]}</span></div>}</>
                                                    ) : msg.content}
                                                </div>
                                                <span className="text-[10px] text-slate-600 mt-2 px-1 uppercase font-bold tracking-wider">{msg.role === "user" ? "You" : character.name}</span>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                                        <div className="flex gap-2 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Terminal className="h-4 w-4 text-slate-500" /></div>
                                            <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessageToCharacter()} placeholder="Enter interrogation question..." className="flex-1 bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-slate-600 font-mono" disabled={chatLoading} autoFocus />
                                            <button onClick={sendMessageToCharacter} disabled={chatLoading || !currentInput.trim()} className={`px-4 py-2 bg-${accent}-600 hover:bg-${accent}-500 disabled:opacity-50 disabled:bg-slate-800 rounded-lg text-white transition-all shadow-lg hover:shadow-${accent}-500/20`}>{chatLoading ? <Cpu className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Quit Modal */}
            {confirmQuitModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-red-500/30 p-6 rounded-xl w-full max-w-sm text-center shadow-2xl">
                        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Abort Investigation?</h2>
                        <p className="text-slate-400 text-sm mb-6">Current case progress will be permanently lost.</p>
                        <div className="flex gap-3">
                            <button onClick={() => { setConfirmQuitModal(false); handleGameEnd(false); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-red-600/20">Confirm</button>
                            <button onClick={() => setConfirmQuitModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-xs font-bold uppercase tracking-wider border border-slate-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default GameStart;