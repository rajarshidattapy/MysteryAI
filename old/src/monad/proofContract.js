// src/monad/proofContract.js

// Paste your actual deployed contract address on Monad Testnet:
export const MYSTERY_PROOF_ADDRESS = "0xacbA85F47BD8C1ED083e803217fb6D7Fd3baC768";

export const MYSTERY_PROOF_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "caseId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timeTaken",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "solved",
        "type": "bool"
      }
    ],
    "name": "GameCompleted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "caseId", "type": "string" },
      { "internalType": "uint256", "name": "timeTaken", "type": "uint256" },
      { "internalType": "bool", "name": "solved", "type": "bool" }
    ],
    "name": "recordGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
