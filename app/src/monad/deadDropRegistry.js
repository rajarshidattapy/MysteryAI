// src/monad/deadDropRegistry.js

// DeadDropRegistry contract deployed on Monad Testnet
export const DEAD_DROP_REGISTRY_ADDRESS = import.meta.env.VITE_DEAD_DROP_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";

export const DEAD_DROP_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "mysteryId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "answerHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "difficulty",
        "type": "uint8"
      }
    ],
    "name": "MysteryCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "mysteryId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "solver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "solveTime",
        "type": "uint256"
      }
    ],
    "name": "MysterySolved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_answerHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "_difficulty",
        "type": "uint8"
      }
    ],
    "name": "createMystery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mysteryCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "mysteries",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "answerHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "solved",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "solver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "solveTime",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "difficulty",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_mysteryId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_culprit",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_salt",
        "type": "string"
      }
    ],
    "name": "solveMystery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

