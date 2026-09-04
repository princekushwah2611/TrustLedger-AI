/**
 * Smart Contract Client Service for TrustLedger AI (v2.1 Master)
 * Interacts with TrustLedgerAudit contract for logs, trust scores, and auditable human overrides.
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const configPath = path.join(__dirname, '../config/contractAddress.json');

function getContractConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Contract configuration file not found at ${configPath}. Please run deploy.js first.`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function getProvider() {
  const rpcUrl = process.env.AMOY_RPC_URL || process.env.RPC_URL || "http://127.0.0.1:8545";
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getSigner() {
  const privateKey = process.env.AI_SIGNER_PRIVATE_KEY || process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

function getContract(signerOrProvider) {
  const config = getContractConfig();
  const sp = signerOrProvider || getSigner();
  return new ethers.Contract(config.contractAddress, config.abi, sp);
}

async function logVerdictOnChain(txId, riskLevel, reasoningText, vendorName = null) {
  const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes(reasoningText));
  const explorerBase = process.env.EXPLORER_BASE || "https://amoy.polygonscan.com";

  try {
    const contract = getContract();
    
    // Log entry
    const tx = await contract.logTransaction(txId, riskLevel, reasoningHash);
    const receipt = await tx.wait();

    // Update Vendor Trust Score on-chain if vendorName provided
    if (vendorName) {
      const vHash = ethers.keccak256(ethers.toUtf8Bytes(vendorName));
      await contract.updateVendorScore(vHash, riskLevel);
    }

    return {
      txHash: receipt.hash,
      explorerUrl: `${explorerBase}/tx/${receipt.hash}`,
      reasoningHash,
      alreadyLogged: false
    };
  } catch (err) {
    const simulatedHash = ethers.keccak256(ethers.toUtf8Bytes(`tx_${txId}_${Date.now()}`));
    return {
      txHash: simulatedHash,
      explorerUrl: `${explorerBase}/tx/${simulatedHash}`,
      reasoningHash,
      simulated: true
    };
  }
}

async function getVendorTrustScore(vendorName) {
  try {
    const contract = getContract(getProvider());
    const score = await contract.getVendorScore(vendorName);
    return Number(score);
  } catch (err) {
    return 100;
  }
}

async function proposeOverrideOnChain(overrideId, originalTxId, newRiskLevel, reasonText) {
  try {
    const contract = getContract();
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reasonText));
    const tx = await contract.proposeOverride(overrideId, originalTxId, newRiskLevel, reasonHash);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, reasonHash };
  } catch (err) {
    const simulatedHash = ethers.keccak256(ethers.toUtf8Bytes(`override_${overrideId}`));
    return { txHash: simulatedHash, simulated: true };
  }
}

async function approveOnChain(txId, customPrivateKey = null) {
  try {
    const provider = getProvider();
    const pk = customPrivateKey || process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(pk, provider);
    const contract = getContract(signer);

    const tx = await contract.approveTransaction(txId);
    const receipt = await tx.wait();

    const updatedEntry = await contract.getEntry(txId);
    return {
      txHash: receipt.hash,
      approvalCount: Number(updatedEntry.approvalCount),
      approved: updatedEntry.approved
    };
  } catch (err) {
    return {
      simulated: true,
      error: err.message
    };
  }
}

module.exports = {
  logVerdictOnChain,
  getVendorTrustScore,
  proposeOverrideOnChain,
  approveOnChain,
  getContractConfig
};
