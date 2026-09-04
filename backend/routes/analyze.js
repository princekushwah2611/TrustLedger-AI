const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { runPreFilter } = require('../services/preFilter');
const { analyzeTransaction } = require('../services/aiEngine');
const { logVerdictOnChain } = require('../services/contractClient');
const store = require('../services/store');

const mockDataPath = path.join(__dirname, '../data/mockTransactions.json');

function getMockTransactions() {
  if (fs.existsSync(mockDataPath)) {
    return JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  }
  return [];
}

router.post('/', async (req, res) => {
  try {
    const allTransactions = getMockTransactions();
    
    // Batch processing mode
    if (req.body.batch) {
      const results = [];
      for (const tx of allTransactions) {
        const preFilterRes = runPreFilter(tx, allTransactions);
        const aiVerdict = await analyzeTransaction(tx, preFilterRes);
        const onChainRes = await logVerdictOnChain(tx.id, aiVerdict.riskScore, aiVerdict.reasoning);

        const requiredApprovals = aiVerdict.riskScore === 'High' ? 2 : (aiVerdict.riskScore === 'Medium' ? 1 : 0);
        const autoApproved = aiVerdict.riskScore === 'Low';

        const record = {
          txId: tx.id,
          transaction: tx,
          riskScore: aiVerdict.riskScore,
          flagType: aiVerdict.flagType,
          reasoning: aiVerdict.reasoning,
          preFlag: preFilterRes.preFlag,
          preFlagReason: preFilterRes.preFlagReason,
          onChain: {
            txHash: onChainRes.txHash,
            explorerUrl: onChainRes.explorerUrl,
            reasoningHash: onChainRes.reasoningHash
          },
          approvalStatus: autoApproved ? 'Approved' : 'Pending',
          requiredApprovals: requiredApprovals,
          currentApprovals: autoApproved ? 0 : 0
        };

        store.saveVerdict(tx.id, record);
        results.push(record);
      }
      return res.json({ success: true, count: results.length, data: results });
    }

    // Single transaction analysis mode
    const tx = req.body;
    if (!tx || !tx.id || !tx.amount || !tx.vendor) {
      return res.status(422).json({ error: "Invalid transaction payload. Requires id, amount, vendor, date." });
    }

    const preFilterRes = runPreFilter(tx, allTransactions);
    const aiVerdict = await analyzeTransaction(tx, preFilterRes);
    const onChainRes = await logVerdictOnChain(tx.id, aiVerdict.riskScore, aiVerdict.reasoning);

    const requiredApprovals = aiVerdict.riskScore === 'High' ? 2 : (aiVerdict.riskScore === 'Medium' ? 1 : 0);
    const autoApproved = aiVerdict.riskScore === 'Low';

    const record = {
      txId: tx.id,
      transaction: tx,
      riskScore: aiVerdict.riskScore,
      flagType: aiVerdict.flagType,
      reasoning: aiVerdict.reasoning,
      preFlag: preFilterRes.preFlag,
      preFlagReason: preFilterRes.preFlagReason,
      onChain: {
        txHash: onChainRes.txHash,
        explorerUrl: onChainRes.explorerUrl,
        reasoningHash: onChainRes.reasoningHash
      },
      approvalStatus: autoApproved ? 'Approved' : 'Pending',
      requiredApprovals: requiredApprovals,
      currentApprovals: autoApproved ? 0 : 0
    };

    store.saveVerdict(tx.id, record);
    res.json(record);
  } catch (err) {
    console.error("[AnalyzeRoute Error]:", err);
    res.status(502).json({ error: "Failed to analyze transaction", details: err.message });
  }
});

module.exports = router;
