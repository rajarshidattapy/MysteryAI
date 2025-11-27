// src/web3/monadWallet.js

const WALLET_KEY = 'monadWalletAddress';

// 🔹 Read stored wallet address
export const getMonadWalletAddress = () => {
  return localStorage.getItem(WALLET_KEY);
};

// 🔹 Clear stored wallet address
export const disconnectMonadWallet = () => {
  localStorage.removeItem(WALLET_KEY);
};

// 🔹 Just for nice UI labels
export const shortenAddress = (addr) => {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};

// 🔹 Detect all injected EVM providers (MetaMask, Phantom EVM, Rabby, etc.)
export const detectWalletProviders = () => {
  if (typeof window === 'undefined') return [];

  const wallets = [];
  const eth = window.ethereum;

  const addProvider = (provider, label, id) => {
    wallets.push({ id, label, provider });
  };

  if (eth?.providers?.length) {
    // Case: multiple providers injected
    eth.providers.forEach((p, index) => {
      if (p.isMetaMask) {
        addProvider(p, 'MetaMask', 'metamask');
      } else if (p.isRabby) {
        addProvider(p, 'Rabby Wallet', 'rabby');
      } else if (p.isPhantom) {
        addProvider(p, 'Phantom (EVM)', 'phantom');
      } else {
        addProvider(p, `Wallet ${index + 1}`, `wallet-${index}`);
      }
    });
  } else if (eth) {
    // Only one provider injected
    if (eth.isMetaMask) {
      addProvider(eth, 'MetaMask', 'metamask');
    } else if (eth.isRabby) {
      addProvider(eth, 'Rabby Wallet', 'rabby');
    } else if (eth.isPhantom) {
      addProvider(eth, 'Phantom (EVM)', 'phantom');
    } else {
      addProvider(eth, 'Default Wallet', 'default');
    }
  }

  return wallets;
};

// 🔹 Connect with a specific provider (by id)
export const connectMonadWallet = async (providerId) => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available');
  }

  const wallets = detectWalletProviders();

  if (!wallets.length) {
    throw new Error('No EVM wallet found. Please install MetaMask / Phantom / Rabby, etc.');
  }

  // If no id provided, fall back to the first one
  const selected = providerId
    ? wallets.find((w) => w.id === providerId)
    : wallets[0];

  if (!selected) {
    throw new Error('Selected wallet is not available');
  }

  const accounts = await selected.provider.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No account selected in wallet');
  }

  const address = accounts[0];

  localStorage.setItem(WALLET_KEY, address);
  return address;
};
