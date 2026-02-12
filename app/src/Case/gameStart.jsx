import React, { useState, useEffect, useRef } from "react"
import Accusation from "./accusation"
import { useCase } from "./useCase"
import Timer from "./timer.jsx"
import UserStats from "../Stats/UserStats"
import { storeEmbeddingsForCase } from "../../src/Supabase/embeddings"
import { cosineSimilarity } from "../../RAG/cosineUtils"
import { getRelevantContext } from "./../../RAG/getRelaventContext" 
import { getEmbeddingFromHF } from "./../../RAG/generateEmbeddingHF"
import { queryAllCaseSummaries } from "./../../RAG/queryAllCaseSummaries"
import { storeOverviewEmbedding } from "../../RAG/storeOverviewEmbedding"
import WalletLeaderboard from "../Stats/WalletLeaderboard.jsx"
import { useAccount, useChainId } from "wagmi"
import { getRandomDifficulty, getDifficultyLabel, getDifficultyColors } from "../utils/difficulty"

// 🎨 Icons
import { 
  Play, MessageSquare, FileText, Users, 
  Siren, X, Clock, Send, ShieldAlert, Cpu, 
  Terminal, Database, FlaskConical, Lightbulb, Eye, Fingerprint, MapPin
} from "lucide-react"

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY"

const GameStart = () => {
  const [loading, setLoading] = useState(false)
  const [, setError] = useState(null)
  const [_selectedIndex, _setSelectedIndex] = useState(null)
  const [_viewing, _setViewing] = useState("suspect")
  const [_showModal, _setShowModal] = useState(false)
  const [_currentInput, _setCurrentInput] = useState("")
  const [_chatLoading, _setChatLoading] = useState(false)
  const _chatEndRef = useRef(null) 
  
  const { caseData, setCaseData } = useCase()
  const [startTime, setStartTime] = useState(Date.now())
  const [totalTimeTaken, setTotalTimeTaken] = useState(0)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [confirmQuitModal, setConfirmQuitModal] = useState(false)

  // Mystery blockchain state
  const [mysteryId, setMysteryId] = useState(null)
  const [salt, setSalt] = useState(null)

  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  // --- FIXED: Reliable Avatar API (DiceBear) ---
  const getGenderBasedAvatar = (username) => {
    const seed = username ? username.replace(/\s+/g, '') : 'unknown'
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=e5e7eb,b6e3f4,c0aede&radius=50&scale=120`
  }

  // Check wallet connection for game access
  useEffect(() => {
    if (!isConnected) {
      console.warn("⚠️ No wallet connected")
    }
  }, [isConnected])

  // --- Game Control Logic ---
  const handleQuit = () => {
    console.log("⚠️ Quit requested")
    setConfirmQuitModal(true)
  }
  
  const handleTimerEnd = () => {
    console.log("⏰ Timer ended")
    alert("Time's up! Game over.")
    handleGameEnd(false)
  }
  
  const handleTimePause = () => {
    console.log("⏸️ Timer paused")
    setIsTimerPaused(true)
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
    setTotalTimeTaken(prev => prev + elapsedTime)
  }

  const handleTimeResume = () => {
    console.log("▶️ Timer resumed")
    setIsTimerPaused(false)
    setStartTime(Date.now())
  }
  
  const handleGameEnd = async (won, finalTime) => {
    const gameTime = finalTime || (isTimerPaused 
      ? totalTimeTaken 
      : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000))

    console.log("🏁 Game ending...", { won, gameTime })

    // Reset game state (stats are read from blockchain, not stored here)
    setCaseData(null)
    setMysteryId(null)
    setSalt(null)
    _setSelectedIndex(null)
    _setShowModal(false)
    setStartTime(Date.now())
    setTotalTimeTaken(0)
    setIsTimerPaused(false)
    
    console.log("✅ Game ended and reset")
  }
  
  const handleSuccessfulSolve = (time) => {
    console.log("🎉 Mystery solved successfully!")
    handleGameEnd(true, time)
  }

  // --- Case Generation / Chat ---


  const extractSummaryForEmbedding = (caseData) => {
    return `${caseData.case_title}. ${caseData.case_overview}`.replace(/\n/g, " ").replace(/"/g, "'").replace(/\\+/g, " ").slice(0, 512)
  }

  const callGemini = async () => {
    setLoading(true)
    setError(null)
    let attempts = 0
    let found = false
    let finalParsed = null
    let summary = null
    let newEmbedding = null
    
    // Generate prompt dynamically
    const randomSettings = ["abandoned amusement park", "deep sea research lab", "underground speakeasy", "snowbound mountain lodge", "suburban block party", "VR gaming expo", "desert music festival", "private jet", "haunted mansion"]
    const randomEvents = ["mask reveal ceremony", "talent show", "blizzard lockdown", "power outage", "silent auction", "fire drill", "art unveiling", "company IPO party"]
    const randomMurderMethods = ["poisoned drink", "electrocuted in bath", "stage light rig collapse", "sabotaged harness", "crossbow from behind curtain", "snake venom", "laced perfume"]
    const seed = Date.now()
    
    const promptObj = {
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
    }
    
    const prompt = JSON.stringify(promptObj, null, 2)
    
    console.log("🚀 Starting case generation...")
    
    while (attempts < 5 && !found) {
      attempts++
      console.log(`📝 Attempt ${attempts}/5`)
      
      try {
        console.log("🔄 Calling Gemini API...")
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        )
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error(`❌ Gemini API HTTP error ${res.status}:`, errorText)
          
          if (res.status === 429) {
            console.warn("⚠️ Rate limited, waiting 2 seconds before retry...")
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
          continue
        }
      
        const data = await res.json()
      
      // Harden Gemini response parsing
      if (!data.candidates || data.candidates.length === 0) {
        console.error("❌ No candidates in Gemini response", data)
        continue
      }
      
      // Check for safety ratings
      const candidate = data.candidates[0]
      if (candidate.safetyRatings && candidate.safetyRatings.some(rating => rating.probability === "HIGH" || rating.probability === "MEDIUM")) {
        console.warn("⚠️ Safety concerns in Gemini response", candidate.safetyRatings)
      }
      
      let text = candidate.content?.parts?.[0]?.text
      
        if (!text) {
          console.error("❌ No text received from Gemini API:", data)
          continue
        }
        
        if (data.error) {
          console.error("❌ Gemini API error:", data.error)
          continue
        }
      
        text = text.replace(/```json|```/g, "").trim()
        text = text.replace(/^\s*[\r\n]/gm, "").trim()
        
        let parsed
        try {
          parsed = JSON.parse(text)
          console.log("✅ Successfully parsed JSON response")
        } catch (parseError) {
          console.error("❌ Failed to parse JSON response:", parseError)
          console.error("Raw text:", text.substring(0, 200) + "...")
          continue
        }
        
        // Validate the parsed data has required fields
        if (!parsed.case_title || !parsed.case_overview || !parsed.suspects) {
          console.error("❌ Invalid case data structure:", parsed)
          continue
        }
        
        console.log("✅ Case parsed successfully:", parsed.case_title)
        summary = extractSummaryForEmbedding(parsed)
        console.log("📊 Generated summary for embedding:", summary.substring(0, 100) + "...")
        
        newEmbedding = await getEmbeddingFromHF(summary)
        
        // Check if embedding generation failed
        if (!newEmbedding) {
          console.error("❌ Failed to generate embedding for summary")
          console.warn("⚠️ Proceeding without embedding similarity check")
          found = true
          finalParsed = parsed
          finalParsed.embedding = null
          break
        }
        
        console.log("✅ Embedding generated successfully")
        
        // Get all past embeddings
        const existingSummaries = await queryAllCaseSummaries()
        console.log(`📚 Found ${existingSummaries.length} existing case summaries`)
        
        // If no existing summaries, this is the first case
        if (existingSummaries.length === 0) {
          console.log("🎉 First case ever - no similarity check needed")
          found = true
          finalParsed = parsed
          finalParsed.embedding = newEmbedding
        } else {
          const tooSimilar = existingSummaries.some((entry) => {
            // Skip entries without valid embeddings
            if (!entry.embedding || !Array.isArray(entry.embedding)) {
              console.warn("⚠️ Skipping entry with invalid embedding:", entry.summary?.substring(0, 50))
              return false
            }
            
            // Validate embedding vector lengths (should be 768 for Sentence Transformers)
            if (newEmbedding.length !== entry.embedding.length) {
              console.warn(`⚠️ Embedding length mismatch: ${newEmbedding.length} vs ${entry.embedding.length}`)
              return false
            }
            
            const sim = cosineSimilarity(newEmbedding, entry.embedding)
            console.log(`📊 Similarity with "${entry.summary?.substring(0, 50)}...": ${sim.toFixed(4)}`)
            return sim > 0.75
          })
        
          if (!tooSimilar) {
            found = true
            finalParsed = parsed
            finalParsed.embedding = newEmbedding
            console.log("✅ Found unique case after similarity check")
          } else {
            console.log("⚠️ Case too similar to existing cases, trying again...")
          }
        }
      } catch (err) {
        console.error(`❌ Error on attempt ${attempts}:`, err)
        console.error("Error details:", {
          message: err.message,
          stack: err.stack
        })
      }
    }
    
    if (!finalParsed) {
      console.error("❌ All attempts failed, generating fallback case")
      
      // Generate a random fallback case from multiple options
      const fallbackCases = [
        // Case 1: Library Mystery
        {
          case_title: "The Mysterious Disappearance",
          case_overview: "A classic murder mystery in a cozy library where nothing is as it seems.",
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
        },
        // Case 2: Art Gallery Heist
        {
          case_title: "The Vanishing Canvas",
          case_overview: "A priceless painting disappears during a gallery opening night, with multiple suspects having opportunity.",
          difficulty: "Medium",
          suspects: [
            {
              name: "Curator Adams",
              gender: "male",
              age: 52,
              clothing: "Formal suit with glasses",
              personality: "Detail-oriented and proud",
              background: "Chief curator with 20 years experience",
              alibi: "Giving a tour to VIP guests",
              is_murderer: true,
              chat: []
            },
            {
              name: "Art Critic Rivera",
              gender: "female",
              age: 35,
              clothing: "Designer dress and statement jewelry",
              personality: "Sharp-tongued and ambitious",
              background: "Renowned art critic for major publications",
              alibi: "Taking photos for her review",
              is_murderer: false,
              chat: []
            },
            {
              name: "Security Guard Chen",
              gender: "male",
              age: 41,
              clothing: "Uniform with radio",
              personality: "Methodical and loyal",
              background: "Former military, 5 years in security",
              alibi: "Making scheduled rounds",
              is_murderer: false,
              chat: []
            }
          ],
          witnesses: [
            {
              name: "Patron Martinez",
              description: "60, wealthy art collector, near the missing painting",
              observation: "Saw someone near the painting but couldn't identify who",
              note: "Person seemed to be adjusting their scarf while standing close",
              chat: []
            }
          ],
          embedding: null
        },
        // Case 3: Corporate Espionage
        {
          case_title: "The Poisoned Proposal",
          case_overview: "During a high-stakes business merger meeting, a executive collapses after drinking champagne.",
          difficulty: "Hard",
          suspects: [
            {
              name: "CEO Williams",
              gender: "female",
              age: 48,
              clothing: "Tailored business suit",
              personality: "Ruthless and calculating",
              background: "Built company from startup to industry leader",
              alibi: "Welcoming guests at entrance",
              is_murderer: false,
              chat: []
            },
            {
              name: "Rival Executive Thompson",
              gender: "male",
              age: 55,
              clothing: "Expensive Italian shoes and watch",
              personality: "Competitive and vindictive",
              background: "Head of competing company facing acquisition",
              alibi: "In bathroom during incident",
              is_murderer: true,
              chat: []
            },
            {
              name: "Personal Assistant Lee",
              gender: "female",
              age: 29,
              clothing: "Professional blouse and skirt",
              personality: "Efficient but secretly resentful",
              background: "Handles all CEO's scheduling and drinks",
              alibi: "Setting up documents in adjacent room",
              is_murderer: false,
              chat: []
            },
            {
              name: "Company Scientist Patel",
              gender: "male",
              age: 42,
              clothing: "Lab coat over casual clothes",
              personality: "Brilliant but nervous",
              background: "Lead researcher with breakthrough discovery",
              alibi: "Demonstrating prototype to investors",
              is_murderer: false,
              chat: []
            }
          ],
          witnesses: [],
          embedding: null
        },
        // Case 4: Theater Murder
        {
          case_title: "Death on the Stage",
          case_overview: "The lead actor is found dead in his dressing room during intermission of opening night.",
          difficulty: "Medium",
          suspects: [
            {
              name: "Leading Lady Foster",
              gender: "female",
              age: 33,
              clothing: "Elegant evening gown",
              personality: "Talented but temperamental",
              background: "Rising star with rumors of difficult behavior",
              alibi: "Receiving flowers in her dressing room",
              is_murderer: false,
              chat: []
            },
            {
              name: "Stage Director Brooks",
              gender: "male",
              age: 58,
              clothing: "Black turtleneck and jeans",
              personality: "Perfectionist with a short fuse",
              background: "Legendary director known for intense methods",
              alibi: "Arguing with crew backstage",
              is_murderer: true,
              chat: []
            },
            {
              name: "Costume Designer Kim",
              gender: "female",
              age: 45,
              clothing: "Covered in fabric scraps",
              personality: "Creative and meticulous",
              background: "Award-winning designer with tight production deadlines",
              alibi: "Fixing a costume emergency",
              is_murderer: false,
              chat: []
            }
          ],
          witnesses: [
            {
              name: "Theater Usher Davis",
              description: "26, part-time employee, cleaning nearby dressing rooms",
              observation: "Heard raised voices but couldn't make out words",
              note: "One voice sounded particularly angry, other seemed defensive",
              chat: []
            }
          ],
          embedding: null
        },
        // Case 5: Luxury Train Mystery
        {
          case_title: "Murder on the Midnight Express",
          case_overview: "A wealthy passenger is found dead in his private compartment on a cross-country luxury train.",
          difficulty: "Hard",
          suspects: [
            {
              name: "Train Conductor Murphy",
              gender: "male",
              age: 47,
              clothing: "Classic conductor uniform with gold trim",
              personality: "Authoritative and rule-following",
              background: "20 years experience, knows every passenger",
              alibi: "Checking tickets in dining car",
              is_murderer: false,
              chat: []
            },
            {
              name: "Wealthy Passenger Rothschild",
              gender: "male",
              age: 62,
              clothing: "Expensive silk pajamas",
              personality: "Arrogant and demanding",
              background: "Billionaire with many enemies",
              alibi: "Sleeping in adjacent compartment",
              is_murderer: false,
              chat: []
            },
            {
              name: "Dining Car Chef Bernard",
              gender: "male",
              age: 39,
              clothing: "White chef's uniform",
              personality: "Passionate but stressed",
              background: "Former sous chef seeking head position",
              alibi: "Preparing midnight snacks",
              is_murderer: true,
              chat: []
            },
            {
              name: "Mysterious Passenger Blackwood",
              gender: "female",
              age: 34,
              clothing: "Dark traveling cloak and gloves",
              personality: "Enigmatic and secretive",
              background: "Claims to be a writer researching train travel",
              alibi: "Reading in observation car",
              is_murderer: false,
              chat: []
            }
          ],
          witnesses: [
            {
              name: "Car Attendant Gomez",
              description: "28, responsible for compartment service, was nearby",
              observation: "Smelled something unusual near the victim's compartment",
              note: "Couldn't place the scent but it wasn't food or perfume",
              chat: []
            }
          ],
          embedding: null
        }
      ];
      
      // Select a random fallback case
      finalParsed = fallbackCases[Math.floor(Math.random() * fallbackCases.length)]
      console.log("✅ Fallback case generated successfully")
    }

    // Helper function to normalize names for blockchain matching
    // CRITICAL: Must match the normalization in accusation.jsx
    const normalizeForBlockchain = (str) => {
      return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };

    // Ensure all suspects and witnesses have chat arrays
    // AND normalize names for blockchain compatibility
    if (finalParsed.suspects) {
      finalParsed.suspects = finalParsed.suspects.map((s) => ({
        ...s,
        chat: s.chat || [],
        // Store both original name (for display) and normalized name (for blockchain)
        displayName: s.name,
        name: normalizeForBlockchain(s.name)
      }))
    }
    if (finalParsed.witnesses) {
      finalParsed.witnesses = finalParsed.witnesses.map((w) => ({
        ...w,
        chat: w.chat || [],
        displayName: w.name,
        name: normalizeForBlockchain(w.name)
      }))
    }

    console.log("✅ Names normalized for blockchain:", {
      suspects: finalParsed.suspects.map(s => ({ original: s.displayName, normalized: s.name }))
    });

    // Assign difficulty level randomly (Easy: 0, Medium: 1, Hard: 2)
    // This matches the Solidity enum: enum Difficulty { Easy, Medium, Hard }
    const difficultyLevel = getRandomDifficulty();
    finalParsed.difficulty = difficultyLevel;

    console.log("🎯 Difficulty assigned:", {
      level: difficultyLevel,
      label: getDifficultyLabel(difficultyLevel)
    });

    // Generate mysteryId and salt for blockchain commitment
    const newMysteryId = Date.now() // Use timestamp as mysteryId
    const newSalt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    setMysteryId(newMysteryId)
    setSalt(newSalt)

    finalParsed.id = newMysteryId.toString()

    console.log("🔐 Mystery initialized:", {
      mysteryId: newMysteryId,
      salt: newSalt
    })

    // Store embeddings for RAG (optional AI context)
    try {
      if (summary && newEmbedding) {
        console.log("💾 Storing embeddings for RAG...")
        await storeOverviewEmbedding(finalParsed.id, summary, newEmbedding)
        await storeEmbeddingsForCase(finalParsed, finalParsed.id)
        console.log("✅ Embeddings stored successfully")
      } else {
        console.warn("⚠️ Skipping embedding storage")
      }
    } catch (error) {
      console.warn("⚠️ Error storing embeddings (non-critical):", error)
    }

    setCaseData(finalParsed)
    setStartTime(Date.now())
    setTotalTimeTaken(0)
    setIsTimerPaused(false)
    setLoading(false)
    
    console.log("🎉 Mystery generation completed successfully!")
    console.log("📋 Final mystery data:", {
      id: finalParsed.id,
      title: finalParsed.case_title,
      suspects: finalParsed.suspects.length,
      witnesses: finalParsed.witnesses.length
    })
  }

  const sendMessageToCharacter = async () => {
    if (!_currentInput.trim()) {
      console.warn("⚠️ Empty message, skipping send")
      return
    }
    
    console.log("💬 Sending message to character:", _currentInput)
    
    const updated = { ...caseData }
    const key = _viewing === "suspect" ? "suspects" : "witnesses"
    const character = updated[key][_selectedIndex]
    
    character.chat.push({ role: "user", content: _currentInput })
    setCaseData(updated)
    _setChatLoading(true)

    // Cap chat history to last 10 messages to avoid token limits
    const recentChat = character.chat.slice(-10)
    const dialog = recentChat.map(msg => 
      msg.role === "user" 
        ? `Investigator: ${msg.content}` 
        : `${character.name}: ${msg.content}${msg.hint ? ` (Hint: ${msg.hint})` : ''}`
    ).join("\n")
    
    // Try to get RAG context (optional, will be null if embeddings disabled)
    let context = await getRelevantContext(caseData.id, _currentInput)

    const finalPrompt = `${_viewing === "suspect" ? `You are ${character.name}, a suspect.` : `You are ${character.name}, a witness.`} Context: ${context || "None"}. Chat: ${dialog}. Respond as ${character.name}, concise (max 35 words). If murderer, lie convincingly. Include 1 generic detective question hint separated by @.`

    try {
      console.log("🤖 Calling Gemini for character response...")
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      )
      
      const data = await res.json()
      
      // Harden Gemini response parsing
      if (!data.candidates || data.candidates.length === 0) {
        console.error("❌ No candidates in Gemini response", data)
        return
      }
      
      // Check for safety ratings
      const candidate = data.candidates[0]
      if (candidate.safetyRatings && candidate.safetyRatings.some(rating => rating.probability === "HIGH" || rating.probability === "MEDIUM")) {
        console.warn("⚠️ Safety concerns in Gemini response", candidate.safetyRatings)
      }
      
      const reply = candidate.content?.parts?.[0]?.text
      
      if (reply) {
        console.log("✅ Character response received:", reply.substring(0, 100) + "...")
        const [response, hint] = reply.split("@").map(s => s.trim())
        character.chat.push({ role: "model", content: response, hint: hint || null })
        setCaseData({ ...updated })
        console.log("✅ Chat updated in local state")
      } else {
        console.error("❌ No reply from character AI")
      }
    } catch (e) { 
      console.error("❌ Error in character chat:", e)
    }
    
    _setCurrentInput("") 
    _setChatLoading(false)
  }
  
  const generateSimpleCase = () => {
    console.log("🧪 Generating test case...")
    callGemini() 
  }

  const handleResetGame = () => {
    console.log("🔄 Resetting game...")
    setCaseData(null)
    _setSelectedIndex(null)
    _setShowModal(false)
    callGemini() 
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-slate-200 font-mono relative overflow-x-hidden">


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
                    <div className="sticky top-20 z-[200] bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl mb-12">

  {/* LEFT HUD INFO */}
  <div className="flex items-center gap-6 flex-wrap">

    {/* LIVE + TIMER */}
    <div className="flex items-center gap-4 px-5 py-3 bg-black/40 rounded-lg border border-purple-500/20">

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-xs font-bold text-red-400 tracking-widest uppercase">
          Live
        </span>
      </div>

      <div className="w-px h-5 bg-slate-700"></div>

      <div className="min-w-[120px]">
        <Timer 
          onTimerEnd={handleTimerEnd} 
          onTimePause={handleTimePause} 
          onTimeResume={handleTimeResume} 
        />
      </div>
    </div>

    {/* CASE ID */}
    <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
      <Terminal className="w-4 h-4" />
      <span>
        CASE_ID: 
        <span className="text-purple-400 ml-1">
          {caseData.id?.slice(0, 8).toUpperCase()}
        </span>
      </span>
    </div>

  </div>

  {/* RIGHT ABORT CONTROL */}
  <div className="flex items-center gap-3">

    {/* Danger label */}
    <span className="hidden sm:block text-[10px] uppercase tracking-widest text-red-400 opacity-70">
      Emergency Control
    </span>

    {/* Abort Button */}
    <button 
      onClick={handleQuit}
      className="group px-5 py-3 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-bold uppercase tracking-wide rounded-lg 
      border border-red-500/30 hover:border-red-400 transition-all 
      flex items-center gap-2 whitespace-nowrap shadow-lg 
      hover:shadow-red-500/20 active:scale-95"
    >
      <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
      Abort Mission
    </button>

  </div>

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
                                        {(() => {
                                          const colors = getDifficultyColors(caseData.difficulty);
                                          const label = getDifficultyLabel(caseData.difficulty);
                                          return (
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                                              {label} Level
                                            </span>
                                          );
                                        })()}
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
                                        onSuccessfulSolve={() => {
                                            const time = isTimerPaused ? totalTimeTaken : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000)
                                            handleSuccessfulSolve(time)
                                        }}
                                        mysteryId={mysteryId}
                                        salt={salt}
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
                                            onClick={() => { _setSelectedIndex(idx); _setViewing("suspect"); _setShowModal(true) }}
                                            className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 rounded-xl p-4 transition-all text-left flex items-center gap-4 shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-slate-600 group-hover:border-purple-400 shadow-inner">
                                                <img src={getGenderBasedAvatar((suspect.displayName || suspect.name).replace(/\s+/g, ''), suspect.gender)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white font-bold text-base truncate group-hover:text-purple-300">{suspect.displayName || suspect.name}</div>
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
                                            onClick={() => { _setSelectedIndex(idx); _setViewing("witness"); _setShowModal(true) }}
                                            className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-xl p-4 transition-all text-left flex items-center gap-4 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-slate-600 group-hover:border-blue-400 shadow-inner">
                                                <img src={getGenderBasedAvatar((witness.displayName || witness.name).replace(/\s+/g, ''), witness.gender)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-white font-bold text-base truncate group-hover:text-blue-300">{witness.displayName || witness.name}</div>
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
            {/* Character Chat Modal */}
            {_showModal && (
              <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-purple-500">
                        <img 
                          src={getGenderBasedAvatar(
                            (_viewing === "suspect" 
                              ? caseData.suspects[_selectedIndex] 
                              : caseData.witnesses[_selectedIndex]
                            ).name.replace(/\s+/g, ''),
                          )} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          {_viewing === "suspect" 
                            ? caseData.suspects[_selectedIndex].name 
                            : caseData.witnesses[_selectedIndex].name}
                        </h3>
                        <p className="text-xs text-slate-400 capitalize">
                          {_viewing} #{_selectedIndex + 1}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => _setShowModal(false)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {(_viewing === "suspect" 
                      ? caseData.suspects[_selectedIndex] 
                      : caseData.witnesses[_selectedIndex]
                    ).chat.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.role === "user" 
                              ? "bg-purple-600 text-white rounded-br-none" 
                              : "bg-slate-800 text-slate-200 rounded-bl-none"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p>{msg.content}</p>
                          ) : (
                            <div>
                              <p>{msg.content}</p>
                              {msg.hint && (
                                <p className="text-xs mt-2 text-purple-300 italic">💡 {msg.hint}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {_chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-bl-none px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={_chatEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={_currentInput}
                        onChange={(e) => _setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessageToCharacter()}
                        placeholder="Ask a question..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={_chatLoading}
                      />
                      <button
                        onClick={sendMessageToCharacter}
                        disabled={_chatLoading || !_currentInput.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors flex items-center justify-center"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        {/* QUIT CONFIRM MODAL */}
{confirmQuitModal && (
  <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">

    <div className="bg-slate-900 border border-red-500/40 rounded-xl p-6 w-[320px] text-center shadow-2xl">

      <h3 className="text-white font-bold mb-3">
        Abort Mission?
      </h3>

      <p className="text-slate-400 text-sm mb-5">
        Current investigation progress will be lost.
      </p>

      <div className="flex justify-center gap-4">

        <button
          onClick={() => {
            console.log("Mission aborted")

            setConfirmQuitModal(false)

            setCaseData(null)
            _setSelectedIndex(null)
            _setShowModal(false)

            setIsTimerPaused(false)
            setTotalTimeTaken(0)
            setStartTime(Date.now())
          }}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white font-bold"
        >
          Abort
        </button>

        <button
          onClick={() => setConfirmQuitModal(false)}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}

      </div>
    )
  }
  
  export default GameStart