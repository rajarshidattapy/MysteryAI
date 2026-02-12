# DeadDrop Deployment Checklist

## ✅ Refactoring Complete

**Status:** All code changes implemented successfully  
**Build Status:** No critical errors (only minor linting warnings)  
**Date:** February 8, 2026

---

## 📋 Pre-Deployment Steps

### 1. Install Dependencies
```bash
cd /home/voyager4/projects/DeadDrop
npm install
```

### 2. Deploy Smart Contracts to Monad Testnet

#### Deploy DeadDropRegistry
```solidity
// contracts/DeadDropRegistry.sol
// Deploy and save the address
```

#### Deploy DeadDropNFT
```solidity
// contracts/DeadDropNFT.sol
// Constructor parameter: DeadDropRegistry address
// Deploy and save the address
```

### 3. Update Contract Addresses

**File:** `/src/monad/deadDropRegistry.js`
```javascript
// Line 4: Replace with your deployed address
export const DEAD_DROP_REGISTRY_ADDRESS = "0xYourDeployedRegistryAddress"
```

**File:** `/src/monad/deadDropNFT.js`
```javascript
// Line 4: Replace with your deployed address
export const DEAD_DROP_NFT_ADDRESS = "0xYourDeployedNFTAddress"
```

### 4. Environment Variables

Create `.env` file (already done if you followed step 3):

```bash
# Copy from template
cp .env.example .env

# Edit with your actual values
nano .env  # or use your preferred editor
```

Required variables:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_DEAD_DROP_REGISTRY_ADDRESS=0xYourDeployedAddress
VITE_DEAD_DROP_NFT_ADDRESS=0xYourDeployedAddress
```

### 5. Test Build
```bash
npm run build
```

### 6. Test Development Server
```bash
npm run dev
```

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Visit homepage (`/`)
- [ ] Click "Connect" button
- [ ] Wallet connect modal appears
- [ ] Connect MetaMask (or other wallet)
- [ ] Prompted to switch to Monad Testnet if on wrong network
- [ ] Successfully switch to Monad Testnet
- [ ] Auto-redirect to `/gameStart`
- [ ] Header shows truncated wallet address
- [ ] Disconnect works and redirects to `/`

### Mystery Generation
- [ ] Click "START INVESTIGATION" button
- [ ] Loading state shows
- [ ] Mystery generates successfully
- [ ] Suspects and witnesses display
- [ ] Timer starts
- [ ] Can click on suspects to open chat modal

### Mystery Solving (On-Chain)
- [ ] Enter suspect name in accusation form
- [ ] Click "Submit Accusation"
- [ ] Wallet prompts for transaction signature
- [ ] Transaction shows "Verifying On-Chain..." status
- [ ] **Correct Answer:**
  - [ ] Transaction succeeds
  - [ ] "Mystery Solved" success message
  - [ ] Shows transaction hash
  - [ ] Green success UI
- [ ] **Wrong Answer:**
  - [ ] Transaction reverts with "Incorrect solution" error
  - [ ] "Wrong Guess" failure message
  - [ ] Red failure UI
  - [ ] Shows correct culprit name

### Stats Display
- [ ] Visit `/gameStart` (no active mystery)
- [ ] Left panel shows "Archives" section
- [ ] `UserStats` component loads
- [ ] If no solves yet: Shows 0 for all stats
- [ ] If mysteries solved: Shows correct numbers from blockchain
- [ ] Stats update after solving a mystery

### Leaderboard
- [ ] Right panel shows "Top Detectives"
- [ ] `WalletLeaderboard` loads
- [ ] If no one solved yet: "No mysteries solved yet"
- [ ] If mysteries solved:
  - [ ] Shows wallet addresses (truncated)
  - [ ] Sorted by fastest solve time
  - [ ] Top 3 have medal icons
  - [ ] Shows solve count per wallet

### Network Handling
- [ ] Switch to wrong network (e.g., Ethereum Mainnet)
- [ ] App detects wrong network
- [ ] Shows "Wrong Network" warning
- [ ] Click "Switch to Monad Testnet"
- [ ] Network switches successfully
- [ ] Warning disappears

### Edge Cases
- [ ] Refresh page while wallet connected → stays connected
- [ ] Disconnect wallet mid-game → can't submit accusations
- [ ] Multiple mysteries in sequence work correctly
- [ ] Browser back/forward navigation works
- [ ] Mobile responsive (test on phone or responsive mode)

---

## 🔍 Post-Deployment Verification

### Blockchain Verification

1. **Check Contract on Monad Explorer**
   - Visit: `https://testnet-explorer.monad.xyz`
   - Search for DeadDropRegistry address
   - Verify contract is verified/deployed

2. **Check MysterySolved Events**
   ```javascript
   // After solving a mystery, check event was emitted
   // Use Monad testnet explorer or etherscan-like interface
   ```

3. **Verify Stats Match Chain**
   - Solve a mystery
   - Check UserStats shows +1 game
   - Check Leaderboard includes your wallet
   - Verify times match what was recorded

### Frontend Verification

1. **Console Logs**
   - Open browser DevTools
   - Check for errors (should be none)
   - Look for successful blockchain transaction logs

2. **Network Tab**
   - Gemini API calls should succeed (200)
   - No failed Supabase auth calls (removed)
   - RPC calls to Monad Testnet working

---

## 🐛 Troubleshooting

### Issue: "Wallet not connected or mystery not initialized"
**Fix:** Make sure mysteryId and salt are generated before allowing accusations

### Issue: Transaction reverts even with correct answer
**Fix:** 
- Check mysteryId matches between frontend and contract
- Verify salt is passed correctly
- Check suspect name matches exactly (case-sensitive?)

### Issue: Stats show 0 even after solving
**Fix:**
- Verify contract address is correct
- Check RPC connection to Monad Testnet
- Ensure events are being emitted properly
- Check `fromBlock: 0n` to scan entire chain

### Issue: "Failed to switch network"
**Fix:**
- Add Monad Testnet to wallet manually
- Network details:
  - Chain ID: 10143
  - RPC: https://testnet-rpc.monad.xyz
  - Symbol: MON
  - Explorer: https://testnet-explorer.monad.xyz

### Issue: AI mystery generation fails
**Fix:**
- Check Gemini API key is valid
- Check API quota/rate limits
- Fallback cases should still work

---

## 🗑️ Cleanup (Optional)

After confirming everything works:

### Delete Old Supabase Auth Files
```bash
rm src/Supabase/auth.js
rm src/Supabase/userAuth.js
rm src/Supabase/cases.js
```

### Delete Old Proof Contract
```bash
rm src/monad/proofContract.js
```

### Update .gitignore
```bash
# Add to .gitignore if not already there
.env
.env.local
node_modules/
dist/
```

---

## 📝 Documentation Updates Needed

### Update README.md
- [ ] Remove references to Supabase auth
- [ ] Add wallet connection instructions
- [ ] Update architecture diagram
- [ ] Add Monad Testnet setup guide
- [ ] Document contract addresses

### Update Package.json
- [ ] Ensure name is "deaddrop" not "mysterai"
- [ ] Update description
- [ ] Update version

---

## 🚀 Deployment

### Option 1: Vercel/Netlify
```bash
npm run build
# Upload dist/ folder
```

### Option 2: IPFS (Fully Decentralized)
```bash
npm run build
# Upload dist/ to IPFS
# Access via gateway
```

### Environment Variables in Production
- Set `VITE_GEMINI_API_KEY` in deployment platform
- No Supabase keys needed anymore!

---

## ✅ Final Verification

Before calling it done:

- [ ] All tests pass
- [ ] Contract addresses updated
- [ ] Build succeeds with no errors
- [ ] Wallet auth works
- [ ] Mystery solving works on-chain
- [ ] Stats read from blockchain correctly
- [ ] Leaderboard displays properly
- [ ] Network switching works
- [ ] UI looks identical to before
- [ ] Mobile responsive
- [ ] README updated
- [ ] Code committed to git

---

## 🎯 Success Criteria

**The refactor is complete when:**

1. ✅ No Supabase authentication dependencies
2. ✅ Wallet is the only form of identity
3. ✅ All mystery solve verification happens on-chain
4. ✅ Stats and leaderboard read from blockchain events
5. ✅ UI looks and feels the same as before
6. ✅ Users can play full game loop on Monad Testnet
7. ✅ Code is clean and maintainable

---

**Current Status:** ✅ Code Complete - Ready for Contract Deployment

**Next Step:** Deploy smart contracts and update addresses

---

*Last Updated: February 8, 2026*

