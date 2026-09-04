import contractConfig from './contractAddress.json';

export const CONTRACT_ADDRESS = contractConfig.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = contractConfig.abi || [];
export const CHAIN_ID = contractConfig.chainId || 80002;
export const EXPLORER_BASE = "https://amoy.polygonscan.com";
