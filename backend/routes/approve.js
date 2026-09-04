const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { approveOnChain } = require('../services/contractClient');

router.post('/', async (req, res) => {
  try {
    const { txId, approverAddress, txHash: clientTxHash } = req.body;

    if (!txId) {
      return res.status(422).json({ error: "Missing required parameter: txId" });
    }

    const record = store.getVerdict(txId);
    if (!record) {
      return res.status(444).json({ error: `Audit entry for tx #${txId} not found` });
    }

    if (record.approvalStatus === 'Approved') {
      return res.status(409).json({ error: "Transaction is already fully approved" });
    }

    // Initialize approvers list tracking
    if (!record.approvers) {
      record.approvers = [];
    }

    if (approverAddress && record.approvers.includes(approverAddress.toLowerCase())) {
      return res.status(409).json({ error: "Transaction already approved by this address" });
    }

    if (approverAddress) {
      record.approvers.push(approverAddress.toLowerCase());
    }

    record.currentApprovals = (record.currentApprovals || 0) + 1;

    if (record.currentApprovals >= record.requiredApprovals) {
      record.approvalStatus = 'Approved';
    }

    if (clientTxHash) {
      record.latestApprovalTxHash = clientTxHash;
    } else {
      // Execute server-side backup on-chain approval call
      const onChainRes = await approveOnChain(txId);
      if (onChainRes.txHash) {
        record.latestApprovalTxHash = onChainRes.txHash;
      }
    }

    store.saveVerdict(txId, record);

    res.json({
      txId: record.txId,
      approvalStatus: record.approvalStatus,
      currentApprovals: record.currentApprovals,
      requiredApprovals: record.requiredApprovals,
      approvers: record.approvers,
      latestApprovalTxHash: record.latestApprovalTxHash || record.onChain.txHash
    });
  } catch (err) {
    console.error("[ApproveRoute Error]:", err);
    res.status(500).json({ error: "Failed to process approval", details: err.message });
  }
});

module.exports = router;
