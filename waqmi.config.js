import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Define Monad Mainnet
export const monad = {
  id: 41454,
  name: 'Monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
}

// Monad Testnet (optional)
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Testnet Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
}

export const config = createConfig({
  chains: [monad, monadTestnet, mainnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' // Get free from cloud.walletconnect.com
    }),
  ],
  transports: {
    [monad.id]: http(),
    [monadTestnet.id]: http(),
    [mainnet.id]: http(),
  },
})