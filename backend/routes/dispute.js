const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { proposeOverrideOnChain } = require('../services/contractClient');

router.post('/', async (req, res) => {
  try {
    const { txId, newRiskLevel = 'Low', reason, user } = req.body;

    if (!txId || !reason) {
      return res.status(422).json({ error: "Missing required parameters: txId and reason" });
    }

    const record = store.getVerdict(txId);
    if (!record) {
      return res.status(404).json({ error: `Audit entry for tx #${txId} not found` });
    }

    const overrideId = Number(`${txId}90${Date.now() % 100}`);
    const onChainRes = await proposeOverrideOnChain(overrideId, txId, newRiskLevel, reason);

    const disputeRecord = {
      overrideId,
      originalTxId: txId,
      newRiskLevel,
      reason,
      proposedBy: user || 'Executive Approver',
      timestamp: new Date().toISOString(),
      onChainTxHash: onChainRes.txHash,
      reasonHash: onChainRes.reasonHash,
      status: 'Proposed (Additive Override Logged)'
    };

    if (!record.disputes) {
      record.disputes = [];
    }
    record.disputes.push(disputeRecord);
    store.saveVerdict(txId, record);

    res.json({
      success: true,
      message: "Auditable dispute override proposed on-chain successfully",
      dispute: disputeRecord
    });
  } catch (err) {
    console.error("[DisputeRoute Error]:", err);
    res.status(500).json({ error: "Failed to propose dispute override", details: err.message });
  }
});

module.exports = router;
