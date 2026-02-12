<div align="center">
  <img src="app/public/monad.png" width="140" alt="DeadDrop Logo" />
</div>

<h1 align="center">DeadDrop 🔍</h1>

<p align="center">
  <strong>On-Chain AI Mystery Game on Monad</strong><br/>
  Solve AI-generated mysteries, interrogate suspects, and prove your detective skills on the blockchain.
</p>

<div align="center">

[![Monad](https://img.shields.io/badge/Monad-Testnet-purple)](https://monad.xyz)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Compatible-blue)](https://eips.ethereum.org/EIPS/eip-8004)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Integrated-green)](https://openclaw.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🎮 What is DeadDrop?

DeadDrop is an interactive detective game where AI generates unique murder mysteries and blockchain verifies your solutions. Each case features dynamic suspects, witnesses, and clues powered by Google Gemini AI. Your detective work is permanently recorded on Monad blockchain with cryptographic proof.

**Key Innovation:** Implements **ERC-8004** standard for non-fungible proof of completion on **Monad**, enabling verifiable achievement tracking and interoperability with **OpenClaw** gaming ecosystem.

---

## ✨ Features

- **🤖 AI-Generated Mysteries** - Every case is unique, powered by Google Gemini
- **🔗 Blockchain Verification** - Solutions verified on-chain via Monad Testnet
- **🏆 Point-Based Scoring** - Easy (3pts), Medium (5pts), Hard (7pts)
- **👥 Live Leaderboard** - Global rankings based on total points from blockchain
- **💬 Interactive Interrogation** - Chat with AI-powered suspects and witnesses
- **🎯 Dynamic Difficulty** - Randomly assigned challenge levels
- **👛 Wallet-Only Auth** - No passwords, just connect your Web3 wallet
- **🎖️ NFT Rewards** - Earn DeadDrop Badge NFTs for solved mysteries
- **🔓 OpenClaw Integration** - Achievements compatible with OpenClaw gaming platform

---

## 🔗 Blockchain Architecture

### ERC-8004 Implementation

DeadDrop implements the **ERC-8004** standard for non-fungible proof of completion, enabling:

- **Verifiable Achievements**: Each solved mystery is a cryptographically proven accomplishment
- **Interoperability**: Achievements recognized across OpenClaw-compatible games
- **Immutable Records**: Solve times, difficulty levels, and scores permanently on-chain
- **Cross-Game Reputation**: Build your detective reputation across the gaming ecosystem

### Smart Contracts on Monad

**DeadDropRegistry** - Core game logic
- Stores mystery commitments (answer hashes)
- Verifies player solutions
- Tracks difficulty levels and solve times
- Emits ERC-8004 compatible events

**DeadDropNFT** - Achievement tokens
- Mints NFT badges for solved mysteries
- Metadata includes mystery details and solve time
- Compatible with OpenClaw achievement system

**Deployed on Monad Testnet:**
- Registry: `0xacbA85F47BD8C1ED083e803217fb6D7Fd3baC768`
- NFT: `[Update after deployment]`

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- TailwindCSS + Lucide Icons
- Wagmi + Viem (Web3 integration)

**Blockchain**
- Monad Testnet (EVM-compatible)
- Solidity 0.8.20
- ERC-8004 standard implementation
- OpenClaw protocol integration

**AI/ML**
- Google Gemini 1.5 Flash (mystery generation)
- HuggingFace Transformers (embeddings)
- RAG pipeline for contextual responses

**Infrastructure**
- Docker + Nginx
- Render.com deployment
- Firebase Firestore (optional metadata)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Monad Testnet MON tokens (for gas)

### Installation

```bash
# Clone the repository
git clone https://github.com/sriya632/MysteryAI.git
cd MysteryAI/app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:5173`

### Environment Variables

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEAD_DROP_REGISTRY_ADDRESS=0xYourRegistryAddress
VITE_DEAD_DROP_NFT_ADDRESS=0xYourNFTAddress

# Optional (for RAG features)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🎯 How to Play

1. **Connect Wallet** - Link your MetaMask to Monad Testnet
2. **Generate Mystery** - AI creates a unique case with suspects and witnesses
3. **Investigate** - Interrogate characters through AI-powered chat
4. **Solve** - Submit your accusation with the culprit's name
5. **Earn Points** - Get 3/5/7 points based on difficulty
6. **Climb Leaderboard** - Compete globally with other detectives

---

## 📊 Scoring System

| Difficulty | Points | Color | Description |
|------------|--------|-------|-------------|
| Easy | 3 | 🟢 Green | Straightforward cases with clear clues |
| Medium | 5 | 🟡 Yellow | Moderate complexity, requires deduction |
| Hard | 7 | 🔴 Red | Complex mysteries with misleading evidence |

**Leaderboard Ranking:**
- Primary: Total points (sum of all solved mysteries)
- Tiebreaker: Fastest solve time

---

## 🏗️ Project Structure

```
DeadDrop/
├── app/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── DeadDropRegistry.sol   # ERC-8004 game logic
│   │   └── DeadDropNFT.sol        # Achievement NFTs
│   ├── src/
│   │   ├── Auth/              # Wallet connection
│   │   ├── Case/              # Mystery game logic
│   │   ├── Stats/             # Leaderboard & user stats
│   │   ├── monad/             # Contract ABIs & addresses
│   │   └── utils/             # Difficulty & helpers
│   ├── docs/                  # Comprehensive documentation
│   └── Dockerfile             # Production deployment
└── old/                       # Legacy code (reference)
```

---

## 🔐 Security Features

- **Cryptographic Commitments**: Mystery answers hashed with salt before storage
- **On-Chain Verification**: Solutions verified by smart contract, not server
- **Wallet Authentication**: No passwords, identity tied to blockchain address
- **Immutable Records**: All achievements permanently recorded on Monad
- **String Normalization**: Case-insensitive, whitespace-tolerant matching

---

## 🌐 OpenClaw Integration

DeadDrop is part of the **OpenClaw** gaming ecosystem, enabling:

- **Cross-Game Achievements**: Your detective reputation recognized across games
- **Unified Leaderboards**: Compete in OpenClaw-wide rankings
- **Achievement Portability**: NFT badges usable in other OpenClaw games
- **Interoperable Rewards**: Earn benefits across the gaming network

Learn more: [openclaw.xyz](https://openclaw.xyz)

---

## 📚 Documentation

Comprehensive guides available in `/app/docs/`:

- **[PROJECT_README.md](app/docs/PROJECT_README.md)** - Full project overview
- **[DIFFICULTY_POINTS_IMPLEMENTATION.md](app/docs/DIFFICULTY_POINTS_IMPLEMENTATION.md)** - Scoring system details
- **[DEPLOY_QUICK_START.md](app/docs/DEPLOY_QUICK_START.md)** - Deployment guide
- **[DEPLOYMENT_CHECKLIST.md](app/docs/DEPLOYMENT_CHECKLIST.md)** - Testing checklist

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t deaddrop-frontend ./app

# Run container
docker run -p 8080:80 \
  -e VITE_GEMINI_API_KEY=your_key \
  -e VITE_DEAD_DROP_REGISTRY_ADDRESS=0x... \
  deaddrop-frontend

# Visit http://localhost:8080
```

See [RENDER_DEPLOYMENT_GUIDE.md](app/docs/RENDER_DEPLOYMENT_GUIDE.md) for production deployment.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🗺️ Roadmap

- [x] ERC-8004 implementation on Monad
- [x] OpenClaw integration
- [x] Point-based scoring system
- [x] Global leaderboard
- [ ] Mobile app (React Native)
- [ ] Multiplayer cooperative mysteries
- [ ] Custom mystery creation tools
- [ ] Voice-based interrogations
- [ ] Cross-chain support (Ethereum, Polygon)
- [ ] Achievement marketplace

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Monad** - High-performance blockchain platform
- **OpenClaw** - Gaming ecosystem and ERC-8004 standard
- **Google Gemini** - AI mystery generation
- **Wagmi** - React hooks for Ethereum
- **Render** - Hosting platform

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sriya632/MysteryAI/issues)
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: [Join our community](https://discord.gg/deaddrop)

---

<div align="center">

**Built with ❤️ for Monad Blitz Nagpur**

🔍 [Start Investigating](https://deaddrop-frontend.onrender.com) | 📖 [Read Docs](app/docs/PROJECT_README.md) | 🎮 [Join OpenClaw](https://openclaw.xyz)

</div>
