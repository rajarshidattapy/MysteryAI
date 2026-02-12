# 🔍 DeadDrop - On-Chain AI Mystery Game

**An interactive AI-powered mystery game deployed on Monad Testnet**

Solve procedurally generated mysteries, interrogate suspects, and prove your detective skills on the blockchain!

[![Monad](https://img.shields.io/badge/Monad-Testnet-purple)](https://monad.xyz)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎮 Features

- **🤖 AI-Generated Mysteries** - Powered by Google Gemini
- **🔗 Blockchain Verification** - Solutions verified on-chain via Monad Testnet
- **🏆 Point-Based Scoring** - Easy (3pts), Medium (5pts), Hard (7pts)
- **👥 Live Leaderboard** - Rankings based on total points from blockchain
- **💬 AI Chat System** - Interrogate suspects and witnesses
- **🎯 Difficulty Levels** - Randomly assigned difficulty for each mystery
- **👛 Wallet-Only Auth** - No passwords, just connect your wallet

---

## 🚀 Live Demo

**Deployed at:** `https://deaddrop-frontend.onrender.com` *(update after deployment)*

---

## 🏗️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Wagmi** - Wallet connection & blockchain interactions
- **Viem** - Ethereum interactions

### Blockchain
- **Monad Testnet** - Smart contract deployment
- **Solidity** - Smart contracts (DeadDropRegistry, DeadDropNFT)

### AI
- **Google Gemini** - Mystery generation & character AI
- **HuggingFace** - Optional embeddings for RAG (disabled due to CORS)

### Deployment
- **Docker** - Containerization
- **Nginx** - Web server
- **Render.com** - Hosting platform

---

## 📁 Project Structure

```
DeadDrop/
├── contracts/              # Solidity smart contracts
│   ├── DeadDropRegistry.sol
│   └── DeadDropNFT.sol
├── src/
│   ├── Auth/              # Wallet connection
│   ├── Case/              # Mystery game logic
│   ├── Header/            # Navigation
│   ├── Hero/              # Landing page
│   ├── monad/             # Contract ABIs & addresses
│   ├── Stats/             # User stats & leaderboard
│   └── utils/             # Difficulty & helpers
├── RAG/                   # AI context (optional)
├── Dockerfile             # Docker build
├── nginx.conf             # Web server config
└── render.yaml            # Render deployment config
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- Docker (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/DeadDrop.git
cd DeadDrop

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

### Environment Variables

Create a `.env` file with:

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEAD_DROP_REGISTRY_ADDRESS=0xYourRegistryAddress
VITE_DEAD_DROP_NFT_ADDRESS=0xYourNFTAddress

# Optional (for RAG features)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

---

## 🐳 Docker Deployment

### Test Locally

```bash
# Build Docker image
docker build -t deaddrop-frontend .

# Run container
docker run -p 8080:80 \
  -e VITE_GEMINI_API_KEY=your_key \
  -e VITE_DEAD_DROP_REGISTRY_ADDRESS=0x... \
  -e VITE_DEAD_DROP_NFT_ADDRESS=0x... \
  deaddrop-frontend

# Visit http://localhost:8080
```

Or use the helper script:

```bash
./docker-test.sh
```

### Deploy to Render

See **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** for quick deployment guide.

See **[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)** for detailed instructions.

**Quick steps:**
1. Push to GitHub
2. Connect to Render.com
3. Select Docker runtime
4. Add environment variables
5. Deploy!

---

## 🎯 How to Play

### 1. Connect Wallet
- Click "Connect" in the header
- Approve connection to Monad Testnet
- Switch network if prompted

### 2. Generate Mystery
- Click "START INVESTIGATION"
- AI generates a unique mystery with suspects and witnesses
- Difficulty is randomly assigned (Easy/Medium/Hard)

### 3. Investigate
- Click on suspects and witnesses to interrogate them
- Ask questions to gather clues
- AI characters respond based on their roles

### 4. Solve Mystery
- Enter the culprit's name in the "Final Verdict Terminal"
- Submit your accusation
- Transaction sent to Monad Testnet for verification

### 5. Earn Points
- ✅ Correct: Earn points based on difficulty
  - Easy: 3 points
  - Medium: 5 points
  - Hard: 7 points
- ❌ Wrong: No points, see correct answer

### 6. Climb Leaderboard
- Total points accumulated across all solved mysteries
- Ranked globally against all players
- Stats tracked on-chain

---

## 📊 Smart Contracts

### DeadDropRegistry

**Functions:**
- `createMystery(bytes32 answerHash, uint8 difficulty)` - Create new mystery
- `solveMystery(uint256 mysteryId, string culprit, string salt)` - Solve mystery
- `mysteries(uint256 mysteryId)` - Get mystery data

**Events:**
- `MysteryCreated(uint256 mysteryId, bytes32 answerHash, uint8 difficulty)`
- `MysterySolved(uint256 mysteryId, address solver, uint256 solveTime)`

### DeadDropNFT

Rewards NFT for solving mysteries (optional).

**Contract Addresses (Monad Testnet):**
- Registry: `[Update after deployment]`
- NFT: `[Update after deployment]`

---

## 🧩 Difficulty System

| Difficulty | Enum | Points | Color |
|------------|------|--------|-------|
| Easy | 0 | 3 | 🟢 Green |
| Medium | 1 | 5 | 🟡 Yellow |
| Hard | 2 | 7 | 🔴 Red |

**How it works:**
1. Difficulty assigned randomly at mystery creation
2. Stored on-chain (immutable)
3. Points calculated from difficulty
4. Leaderboard ranks by total points

---

## 📚 Documentation

- **[REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)** - Architecture overview
- **[DIFFICULTY_POINTS_IMPLEMENTATION.md](./DIFFICULTY_POINTS_IMPLEMENTATION.md)** - Points system
- **[BLOCKCHAIN_ERROR_HANDLING_SUMMARY.md](./BLOCKCHAIN_ERROR_HANDLING_SUMMARY.md)** - Error handling
- **[STRING_MATCHING_GUIDE.md](./STRING_MATCHING_GUIDE.md)** - Name normalization
- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Environment variables
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Testing checklist
- **[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)** - Deployment guide

---

## 🔐 Security

### Wallet Authentication
- No email/password required
- Wallet signature verifies identity
- All actions on-chain

### Solution Verification
- Answer hashed with salt
- Stored on-chain as commitment
- Verified via smart contract
- Impossible to cheat

### String Normalization
- Case-insensitive matching
- Whitespace tolerance
- Prevents accidental mismatches

---

## 🐛 Known Issues

### RAG/Embeddings Disabled
- HuggingFace API blocked by CORS in browser
- RAG context currently disabled
- Game works perfectly without it
- See [RAG_EMBEDDINGS_INFO.md](./RAG_EMBEDDINGS_INFO.md)

### Free Tier Limitations (Render)
- Service spins down after 15min inactivity
- ~30s cold start time
- Upgrade to Starter plan for always-on

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Monad** - Blockchain platform
- **Google Gemini** - AI mystery generation
- **Wagmi** - React hooks for Ethereum
- **Render** - Hosting platform
- **Tailwind CSS** - UI styling

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/DeadDrop/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/DeadDrop/discussions)
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multiplayer mysteries
- [ ] Custom mystery creation
- [ ] Achievement system
- [ ] Mystery marketplace
- [ ] Cross-chain support

---

**Built with ❤️ for Monad Blitz Nagpur**

🔍 **Start Investigating:** [Deploy Now](./DEPLOY_QUICK_START.md)

