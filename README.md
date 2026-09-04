# TrustLedger AI

**An AI-Powered Financial Controller Secured by Blockchain**

TrustLedger AI is an autonomous financial oversight system for startups and SMEs. It ingests company transactions, uses an LLM acting as a "financial controller persona" to assess risk and explain its reasoning in plain language, and permanently records every AI verdict on a Polygon Amoy smart contract. High-risk transactions are held pending human multisig approval before funds move.

---

## 🏗 Repository Structure

```text
trustledger-ai/
├── contracts/             # Solidity Smart Contracts (TrustLedgerAudit.sol)
├── scripts/               # Hardhat Deployment Scripts
├── test/                  # Smart Contract Unit Tests
├── backend/               # Express API Service & AI Engine
│   ├── routes/            # API endpoints (analyze, auditLog, approve)
│   ├── services/          # aiEngine, preFilter, contractClient
│   └── data/              # mockTransactions.json dataset
├── frontend/              # React + Vite + Tailwind Dashboard
│   └── src/
│       ├── components/    # TransactionList, TransactionDetail, SummaryPanel, WalletConnect
│       └── App.jsx
├── hardhat.config.js      # Hardhat Configuration
└── README.md
```

---

## 🚀 Quick Start

### 1. Root & Contracts Setup
```bash
npm install
npx hardhat compile
```

### 2. Backend Service
```bash
cd backend
npm install
npm start
```

### 3. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡 Features

- **Mock Transaction Dataset**: 30–50 transactions with planted fraud/policy anomalies.
- **Rule-Based Pre-Filter**: Instant check for duplicates and threshold evasion.
- **AI Reasoning Engine**: Structured JSON risk assessment with plain-language reasoning.
- **Immutable Smart Contract**: `TrustLedgerAudit.sol` deployed on Polygon Amoy.
- **Multisig Approval Workflow**: Low (Auto), Medium (1-sig), High (2-of-3 multisig).
- **Interactive Dashboard**: MetaMask connect, PolygonScan proof links, and risk statistics.
