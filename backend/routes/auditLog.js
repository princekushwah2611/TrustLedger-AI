const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const store = require('../services/store');
const { runPreFilter } = require('../services/preFilter');
const { analyzeTransaction } = require('../services/aiEngine');
const { logVerdictOnChain, getVendorTrustScore } = require('../services/contractClient');

const mockDataPath = path.join(__dirname, '../data/mockTransactions.json');

function getMockTransactions() {
  if (fs.existsSync(mockDataPath)) {
    return JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  }
  return [];
}

router.get('/', async (req, res) => {
  try {
    const mockTxList = getMockTransactions();
    const storedVerdicts = store.getAllVerdicts();
    const auditLogs = [];

    // Calculate vendor risk history counts locally to ensure reliable trust score badge calculation
    const vendorRiskCounts = {};
    mockTxList.forEach(tx => {
      const v = tx.vendor;
      if (!vendorRiskCounts[v]) vendorRiskCounts[v] = 100;
    });

    for (const tx of mockTxList) {
      let record = storedVerdicts[tx.id];

      if (!record) {
        const preFilterRes = runPreFilter(tx, mockTxList);
        const currentVendorScore = vendorRiskCounts[tx.vendor] || 100;
        
        const aiVerdict = await analyzeTransaction(tx, preFilterRes, currentVendorScore);
        const onChainRes = await logVerdictOnChain(tx.id, aiVerdict.riskScore, aiVerdict.reasoning, tx.vendor);

        // Update local vendor score tracking
        if (aiVerdict.riskScore === 'High') {
          vendorRiskCounts[tx.vendor] = Math.max(0, (vendorRiskCounts[tx.vendor] || 100) - 15);
        } else if (aiVerdict.riskScore === 'Medium') {
          vendorRiskCounts[tx.vendor] = Math.max(0, (vendorRiskCounts[tx.vendor] || 100) - 5);
        }

        const requiredApprovals = aiVerdict.riskScore === 'High' ? 2 : (aiVerdict.riskScore === 'Medium' ? 1 : 0);
        const autoApproved = aiVerdict.riskScore === 'Low';

        record = {
          txId: tx.id,
          transaction: tx,
          riskScore: aiVerdict.riskScore,
          flagType: aiVerdict.flagType,
          reasoning: aiVerdict.reasoning,
          vendorTrustScore: vendorRiskCounts[tx.vendor] || 100,
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
      }

      auditLogs.push(record);
    }

    auditLogs.sort((a, b) => new Date(b.transaction.date) - new Date(a.transaction.date));

    res.json(auditLogs);
  } catch (err) {
    console.error("[AuditLogRoute Error]:", err);
    res.status(500).json({ error: "Failed to fetch audit log", details: err.message });
  }
});

module.exports = router;
