import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'

// --- Monad Mainnet ---
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

// --- Monad Testnet ---
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
}

export const config = createConfig({
  autoConnect: true,   // ⭐ REQUIRED

  chains: [monad, monadTestnet],

  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],

  transports: {
    [monad.id]: http(monad.rpcUrls.default.http[0]),
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
})
