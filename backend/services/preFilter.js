/**
 * Rule-Based Pre-Filter Service for TrustLedger AI (v2.1 Master)
 * Detects duplicates, threshold evasion, timing anomalies, and structuring/smurfing patterns.
 */

const DEFAULT_APPROVAL_THRESHOLD = parseInt(process.env.APPROVAL_THRESHOLD || '50000', 10);

function runPreFilter(transaction, allTransactions = []) {
  const flags = [];
  const txDate = new Date(transaction.date);
  const vendorName = transaction.vendor.trim().toLowerCase();

  // 1. Check for Duplicate Invoices (same vendor + exact same amount within 48 hours)
  const duplicate = allTransactions.find(t => 
    t.id !== transaction.id &&
    t.vendor.trim().toLowerCase() === vendorName &&
    t.amount === transaction.amount &&
    Math.abs(new Date(t.date) - txDate) <= 48 * 60 * 60 * 1000
  );

  if (duplicate) {
    flags.push(`Potential duplicate payment of ₹${transaction.amount.toLocaleString('en-IN')} to ${transaction.vendor} within 48 hours (matches Tx #${duplicate.id}).`);
  }

  // 2. Check for Threshold Evasion (amount within 5% below approval threshold)
  const minThresholdLimit = DEFAULT_APPROVAL_THRESHOLD * 0.95;
  if (transaction.amount >= minThresholdLimit && transaction.amount < DEFAULT_APPROVAL_THRESHOLD) {
    flags.push(`Amount ₹${transaction.amount.toLocaleString('en-IN')} is within 5% below the ₹${DEFAULT_APPROVAL_THRESHOLD.toLocaleString('en-IN')} manager approval threshold.`);
  }

  // 3. Check for Structuring / Smurfing Pattern (v2.1 Feature F2)
  // Group transactions to same vendor within rolling 7-day window
  const vendor7DayTx = allTransactions.filter(t => {
    const isSameVendor = t.vendor.trim().toLowerCase() === vendorName;
    const diffDays = Math.abs(new Date(t.date) - txDate) / (1000 * 60 * 60 * 24);
    return isSameVendor && diffDays <= 7;
  });

  const totalVendorSum = vendor7DayTx.reduce((sum, t) => sum + t.amount, 0);
  const allSubThreshold = vendor7DayTx.every(t => t.amount < DEFAULT_APPROVAL_THRESHOLD);

  if (vendor7DayTx.length >= 3 && totalVendorSum >= DEFAULT_APPROVAL_THRESHOLD * 1.5 && allSubThreshold) {
    flags.push(`Structuring/Smurfing pattern detected: ${vendor7DayTx.length} payments to ${transaction.vendor} within 7 days total ₹${totalVendorSum.toLocaleString('en-IN')} (exceeding 1.5x approval threshold) while each individual payment stays under ₹${DEFAULT_APPROVAL_THRESHOLD.toLocaleString('en-IN')}.`);
  }

  // 4. Check for Timing Anomalies (late night 11pm-5am or weekend)
  const hour = txDate.getUTCHours();
  const day = txDate.getUTCDay(); // 0 is Sunday
  if ((hour >= 23 || hour <= 5) || day === 0) {
    const timingNote = day === 0 ? "processed on a Sunday" : `processed at off-hours (${hour.toString().padStart(2, '0')}:00 UTC)`;
    flags.push(`Transaction timestamp flag: ${timingNote}.`);
  }

  const preFlag = flags.length > 0;
  const preFlagReason = preFlag ? flags.join(" ") : null;

  return {
    preFlag,
    preFlagReason
  };
}

module.exports = { runPreFilter };
