import React, { useState, useEffect } from "react";
import Accusation from "./accusation";
import { useCase } from "./useCase";
import { storeCaseInSupabase, updateCaseChat } from "../Supabase/storeCase.jsx";
import Timer from "./timer.jsx";
import UserStats from "../Stats/UserStats";
import { isAuthenticated } from "../Auth/Auth";
import { supabase } from "../supabaseClient";
import { storeEmbeddingsForCase } from "../Supabase/storeEmbeddings";
import { cosineSimilarity } from "../../RAG/cosineUtils";
import { getRelevantContext } from "./../../RAG/getRelaventContext";
import { getEmbeddingFromHF } from "./../../RAG/generateEmbeddingHF";
import { queryAllCaseSummaries } from "./../../RAG/queryAllCaseSummaries";
import { storeOverviewEmbedding } from "../../RAG/storeOverviewEmbedding";

const API_KEY = "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"; // TODO: Replace with your OpenRouter API Key

const GameStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewing, setViewing] = useState("suspect");
  const [showModal, setShowModal] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const getGenderBasedAvatar = (username, gender) => {
    const formattedUsername = encodeURIComponent(username);

    if (gender && gender.toLowerCase() === 'female') {
      return `https://avatar.iran.liara.run/public/girl?username=${formattedUsername}`;
    } else {
      return `https://avatar.iran.liara.run/public/boy?username=${formattedUsername}`;
    }
  };

  const { caseData, setCaseData } = useCase();

  const [startTime, setStartTime] = useState(Date.now());
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [confirmQuitModal, setConfirmQuitModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  // Get current username on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUsername(user.user_metadata.display_name || user.user_metadata.username);
      }
    };
    fetchUser();
  }, []);

  // Save game stats to Supabase
  const saveGameStats = async (result, timeTaken) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Save game details to games table
      const { error } = await supabase.from('games').insert([
        {
          user_id: user.id,
          case_title: caseData?.case_title || "Mystery Case",
          solved: result,
          time_taken: timeTaken,
          created_at: new Date(),
          case_id: caseData?.id || null
        }
      ]);

      if (error) throw error;

      // Update user stats (optional, if you want to keep aggregate stats in users table)
      // For now, we can calculate stats on the fly or use a trigger
    } catch (error) {
      console.error("Error saving game stats:", error);
    }
  };

  const handleQuit = () => {
    setConfirmQuitModal(true);
  };

  const handleTimerEnd = () => {
    // Logic for when timer ends
    alert("Time's up! Game over.");
    handleGameEnd(false);
  };

  const handleTimePause = () => {
    setIsTimerPaused(true);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    setTotalTimeTaken(prev => prev + elapsedTime);
  };

  const handleTimeResume = () => {
    setIsTimerPaused(false);
    setStartTime(Date.now());
  };

  const handleGameEnd = (won, finalTime) => {
    // Calculate total time if not provided
    const gameTime = finalTime || (isTimerPaused
      ? totalTimeTaken
      : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000));

    // Save game stats
    saveGameStats(won, gameTime);

    // Reset game state
    setCaseData(null);
    setSelectedIndex(null);
    "desert music festival", "private jet", "haunted mansion"
  ];

const randomEvents = [
  "mask reveal ceremony", "talent show", "blizzard lockdown", "power outage",
  "silent auction", "fire drill", "art unveiling", "company IPO party"
];

const randomMurderMethods = [
  "poisoned drink", "electrocuted in bath", "stage light rig collapse", "sabotaged harness",
  "crossbow from behind curtain", "snake venom", "laced perfume"
];

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
  return `${caseData.case_title}. ${caseData.case_overview}`
};

// Function to call OpenRouter API
const callOpenRouter = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.href,
          "X-Title": "MysteryAI",
        },
        body: JSON.stringify({
          model: "x-ai/grok-4.1-fast:free",
          messages: [
            { role: "user", content: prompt }
          ]
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    let text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("No content received from API");

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedCase = JSON.parse(text);

    // Store case in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const caseId = await storeCaseInSupabase(parsedCase, user.id);
      parsedCase.id = caseId;

      // Store embeddings
      await storeEmbeddingsForCase(parsedCase, caseId);
    }

    setCaseData(parsedCase);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
    setIsTimerPaused(false);

  } catch (err) {
    console.error("Error generating case:", err);
    setError(err.message || "Failed to generate case");
  } finally {
    setLoading(false);
  }
};

const generateSimpleCase = async () => {
  setLoading(true);
  setError(null);

  // Simulating a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const simpleCase = {
    case_title: "The Missing Cookie",
    case_overview: "Who stole the cookie from the cookie jar?",
    difficulty: "Easy",
    suspects: [
      { name: "Cookie Monster", gender: "Male", alibi: "I was eating veggies.", is_murderer: true, chat: [] },
      { name: "Elmo", gender: "Male", alibi: "I was tickling myself.", is_murderer: false, chat: [] }
    ],
    witnesses: [],
    id: "test-case-id"
  };

  setCaseData(simpleCase);
  setStartTime(Date.now());
  setTotalTimeTaken(0);
  setIsTimerPaused(false);
  setLoading(false);
};

const sendMessageToCharacter = async () => {
  if (!currentInput.trim() || !caseData || selectedIndex === null) return;

  const characterType = viewing === "suspect" ? "suspects" : "witnesses";
  const character = caseData[characterType][selectedIndex];

  // Add user message to UI immediately
  const updatedCaseData = { ...caseData };
  updatedCaseData[characterType][selectedIndex].chat.push({
    role: "user",
    content: currentInput
  });
  setCaseData(updatedCaseData);
  setCurrentInput("");
  setChatLoading(true);

  try {
    const context = `You are roleplaying as ${character.name}, a ${viewing} in a murder mystery.
      Case Context: ${caseData.case_overview}
      Your Profile: ${JSON.stringify(character)}
      User Question: ${currentInput}
      
      Answer in character. Be concise. If you are the murderer, be deceptive but consistent with your alibi.`;

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.href,
          "X-Title": "MysteryAI",
        },
        body: JSON.stringify({
          model: "x-ai/grok-4.1-fast:free",
          messages: [
            { role: "user", content: context }
          ]
        }),
      }
    );

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    // Add model response to UI
    updatedCaseData[characterType][selectedIndex].chat.push({
      role: "model",
      content: reply
    });
    setCaseData(updatedCaseData);

    // Update chat in Supabase
    if (caseData.id) {
      await updateCaseChat(caseData.id, {
        suspects: updatedCaseData.suspects,
        witnesses: updatedCaseData.witnesses
      });
    }

  } catch (err) {
    console.error("Chat error:", err);
  } finally {
    setChatLoading(false);
  }
};

// Redirect if not logged in
useEffect(() => {
  const checkAuth = async () => {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      window.location.href = '/auth';
    }
  };
  checkAuth();
}, []);

return (
  <div className="min-h-screen bg-slate-900 text-white p-6 font-mono">
    <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">🕵️ Murder Mystery</h1>

    {!caseData && <UserStats />}

    <div className="flex items-center space-x-4 mb-4">
      {/* Timer */}
      {caseData && (
        <Timer
          onTimerEnd={handleTimerEnd}
          onTimePause={handleTimePause}
          onTimeResume={handleTimeResume}
        />
      )}

      {/* Quit Button */}
      {caseData && (
        <button
          onClick={handleQuit}
          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
        >
          Quit
        </button>
      )}
    </div>

    {/* Only show Generate Case button when no case is active */}
    {!caseData && (
      <div className="flex justify-center mb-10 gap-4">
        <button
          onClick={callOpenRouter}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Case"}
        </button>

        {error && (
          <button
            onClick={() => setError(null)}
            className="px-4 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-500 text-sm"
          >
            🔄 Retry
          </button>
        )}

        {/* Debug button to clear embeddings */}
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/clear-embeddings', { method: 'POST' });
              if (response.ok) {
                console.log("✅ Embeddings cleared for testing");
              }
            } catch (err) {
              console.log("No clear endpoint available, continuing...");
            }
          }}
          className="px-4 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 text-sm"
          title="Clear stored embeddings for testing"
        >
          🧹 Clear DB
        </button>

        {/* Simple test case button */}
        <button
          onClick={generateSimpleCase}
          className="px-4 py-3 bg-green-600 rounded-lg hover:bg-green-500 text-sm"
          title="Generate a simple test case"
        >
          🧪 Test Case
        </button>
      </div>
    )}

    {error && <p className="text-red-400 text-center mb-4">{error}</p>}

    {caseData && (
      <>
        <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl border border-purple-900 shadow-xl mb-10">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{caseData.case_title}</h2>
          <p className="text-sm text-purple-100 mb-2"><strong>Difficulty:</strong> {caseData.difficulty}</p>
          <p className="text-white">{caseData.case_overview}</p>
        </div>

        <div className="flex justify-center gap-6 flex-wrap mb-8">
          <h2>Interact with the characters to know more!</h2>
        </div>

        <div className="flex justify-center gap-6 flex-wrap mb-8">
          {caseData.suspects.map((suspect, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <button
                onClick={() => {
                  setSelectedIndex(idx);
                  setViewing("suspect");
                  setShowModal(true);
                }}
                className="w-24 h-24 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg overflow-hidden p-0 border-2 border-purple-400"
              >
                <img
                  src={getGenderBasedAvatar(suspect.name.replace(/\s+/g, ''), suspect.gender)}
                  alt={`${suspect.name} avatar`}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="mt-2 text-sm text-center text-purple-200">{suspect.name}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 flex-wrap mb-8">
          {caseData.witnesses.map((witness, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <button
                onClick={() => {
                  setSelectedIndex(idx);
                  setViewing("witness");
                  setShowModal(true);
                }}
                className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md overflow-hidden p-0 border-2 border-blue-400"
              >
                <img
                  src={getGenderBasedAvatar(witness.name.replace(/\s+/g, ''), witness.gender)}
                  alt={`${witness.name} avatar`}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="mt-2 text-sm text-center text-blue-200">{witness.name}</span>
            </div>
          ))}
        </div>

        <Accusation
          caseData={caseData}
          onResetGame={handleResetGame}
          onSuccessfulSolve={() => {
            // Calculate total time
            const totalTime = isTimerPaused
              ? totalTimeTaken
              : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000);

            handleSuccessfulSolve(totalTime);
          }}
        />
      </>
    )}

    {/* Modal */}
    {showModal && selectedIndex !== null && caseData?.[viewing === "suspect" ? "suspects" : "witnesses"]?.[selectedIndex] && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
        <div className="bg-slate-800 border border-purple-900 p-8 rounded-xl shadow-2xl w-full max-w-xl relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
          >
            ✖
          </button>

          {(() => {
            const character = caseData[viewing === "suspect" ? "suspects" : "witnesses"][selectedIndex];
            return (
              <>
                <div className="text-white space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-purple-300">
                    {viewing === "suspect" ? "🕵️ Interviewing" : "👀 Witness"} {character.name}
                  </h3>
                  {Object.entries(character)
                    .filter(([key]) => !["chat", "name", "is_murderer"].includes(key))
                    .map(([key, value], i) => (
                      <p key={i}>
                        <strong className="capitalize">{key}:</strong> {value}
                      </p>
                    ))}
                </div>

                <div className="bg-slate-700 h-64 rounded p-3 overflow-y-auto text-sm space-y-3">
                  {character.chat.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-300 text-black"
                        }`}>
                        {msg.role === "model" && msg.parts ? (
                          <div>
                            <div className="font-normal">{msg.parts[0]}</div>
                            {msg.parts[1] && (
                              <div className="mt-2 font-italic text-xs italic text-gray-600">
                                <span className="font-bold">Hint:</span> {msg.parts[1]}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>{msg.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex mt-4 gap-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessageToCharacter()}
                    placeholder="Ask a question..."
                    className="flex-1 p-2 rounded bg-slate-600 text-white"
                  />
                  <button
                    onClick={sendMessageToCharacter}
                    disabled={chatLoading}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                  >
                    {chatLoading ? "..." : "Send"}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}

    {confirmQuitModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
        <div className="bg-slate-800 border border-purple-900 p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <h2 className="text-xl text-purple-200 font-semibold mb-4">Quit Game?</h2>
          <p className="text-white mb-6">Are you sure you want to quit the game?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setConfirmQuitModal(false);
                handleGameEnd(false); // Quit without solving the case
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
            >
              Yes, Quit
            </button>
            <button
              onClick={() => setConfirmQuitModal(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default GameStart;