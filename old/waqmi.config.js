// wagmi.config.js
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
  // ✅ Only Monad mainnet + testnet
  chains: [monad, monadTestnet],

  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],

  // ✅ Use each chain's own RPC URL
  transports: {
    [monad.id]: http(monad.rpcUrls.default.http[0]),
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
})


// export function useMonadNetwork() {
//   const chainId = useChainId()

//   return {
//     chainId,
//     isMonadMainnet: chainId === monad.id,
//     isMonadTestnet: chainId === monadTestnet.id,
//   }
// }