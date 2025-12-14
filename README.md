<div align="center">
  <img src="public/monad.png" width="140" alt="MysteryAI Logo" />
</div>

<h1 align="center">MysteryAI</h1>

<p align="center">
  An AI-powered murder mystery game where every case is unique.<br/>
  Interrogate suspects, analyze testimonies, and uncover the truth — powered by advanced AI and verified on blockchain.
</p>

<br/>

<div align="center">
  <video src="public/video.mp4" width="100%" controls></video>
</div>

## Features

- **Dynamic Case Generation**: Each mystery is procedurally generated using Google Gemini AI with unique settings, suspects, and murder methods
- **Interactive Interrogation**: Chat with AI-powered suspects and witnesses who respond based on their personalities and roles
- **RAG-Enhanced Conversations**: Retrieval-Augmented Generation ensures contextually relevant responses using HuggingFace embeddings
- **Blockchain Verification**: Game completions are recorded on Monad blockchain with cryptographic proof
- **Dual Authentication**: Sign in with Supabase Auth or connect your Web3 wallet (MetaMask)
- **Smart Deduplication**: Cosine similarity checks prevent repetitive case generation
- **Leaderboard System**: Track your stats and compete with other players
- **Timed Challenges**: Race against the clock to solve mysteries

## Tech Stack

**Frontend**: React 19, Vite, TailwindCSS, React Router  
**Authentication**: Supabase Auth + Web3 (Wagmi, Viem, Ethers.js)  
**Database**: Supabase Database  
**AI/ML**: Google Gemini 1.5 Flash, HuggingFace (sentence-transformers/all-MiniLM-L6-v2)  
**Blockchain**: Monad (Mainnet & Testnet), Smart Contract integration  
**State Management**: React Context API

## Architecture

- **Case Generation**: Gemini AI creates unique mysteries with suspects, witnesses, and clues
- **Embedding Storage**: Case summaries are vectorized and stored to prevent duplicates
- **RAG Pipeline**: User questions are embedded and matched against case context for relevant AI responses
- **On-Chain Proof**: Solved cases are recorded on Monad blockchain with wallet signatures
- **Stats Tracking**: Supabase stores game history, solve times, and win rates

## Setup

```bash
# Clone the repository
git clone https://github.com/sriya632/MysteryAI.git
cd MysteryAI

# Install dependencies
npm install

# Run development server
npm run dev
```

## Configuration

Add your API keys to Supabase Database:
- Table: `apis`
- Row: `0`
- Columns: `huggingface_api`, Google Gemini API key in code

Update Supabase config in `src/Supabase/userAuth.js` and `src/Supabase/supabaseClient.js`

## Smart Contract

Deployed on Monad Testnet at: `0xacbA85F47BD8C1ED083e803217fb6D7Fd3baC768`

Records game completions with:
- Case ID
- Time taken
- Solved status
- Player address

## Game Flow

1. Sign in with email/password or connect Web3 wallet
2. Generate a unique mystery case
3. Interview suspects and witnesses through AI chat
4. Analyze clues and make deductions
5. Submit your accusation
6. Get results recorded on-chain (if wallet connected)

## Future Enhancements

- Adaptive difficulty based on player performance
- Voice-based interrogations
- Visual clue system
- Multi-player cooperative mode
- Case sharing and community ratings