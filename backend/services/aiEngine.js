/**
 * AI Reasoning Engine for TrustLedger AI (v2.1 Master)
 * Acts as a Financial Controller Persona incorporating Vendor Trust Scores & Structuring patterns.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const SYSTEM_PROMPT = `You are a financial controller reviewing company transactions for fraud, policy violations, and anomalies.

You will be given a transaction, optional pre-filter notes, and the vendor's current trust score (0-100, where 100 = clean history).
Return ONLY valid JSON with this exact shape and nothing else:
{
  "riskScore": "Low" | "Medium" | "High",
  "flagType": "Duplicate" | "Threshold-Evasion" | "Unusual-Vendor" | "Timing-Anomaly" | "Structuring" | "Normal",
  "reasoning": "2-3 sentence plain-language explanation a non-technical founder could understand"
}

Consider: duplicate invoices, round-number payments to new vendors, amounts just under approval thresholds, unusual timing (weekends, late night, month-end clustering), and structuring patterns (several smaller payments to the same vendor that add up to a large sum). If the vendor's trust score is below 70, weigh new transactions from that vendor more strictly even if they look individually minor. If the pre-filter notes indicate a likely issue, weigh that heavily but verify it makes sense for this specific transaction. Do not include any text outside the JSON object.`;

/**
 * Fallback Controller Heuristic Engine incorporating Vendor Trust Score & Structuring
 */
function fallbackReasoning(transaction, preFilterResult, vendorScore = 100) {
  const { preFlag, preFlagReason } = preFilterResult;
  const vendorLower = (transaction.vendor || '').toLowerCase();

  if (preFlagReason && preFlagReason.includes('Structuring')) {
    return {
      riskScore: "High",
      flagType: "Structuring",
      reasoning: `Multiple payments to ${transaction.vendor} within 7 days total ₹${transaction.amount.toLocaleString('en-IN')}+ and exceed 1.5x approval limits. Structuring payments into smaller installments to bypass manager sign-off is a serious policy violation.`
    };
  }

  if (preFlagReason && preFlagReason.includes('duplicate')) {
    return {
      riskScore: "High",
      flagType: "Duplicate",
      reasoning: `Identical payment of ₹${transaction.amount.toLocaleString('en-IN')} to ${transaction.vendor} was submitted within 48 hours. This indicates potential duplicate billing or a double payment error that requires verification before release.`
    };
  }

  if (preFlagReason && preFlagReason.includes('approval threshold')) {
    return {
      riskScore: "High",
      flagType: "Threshold-Evasion",
      reasoning: `The payment amount of ₹${transaction.amount.toLocaleString('en-IN')} is strategically structured just below the ₹50,000 formal approval limit. This pattern frequently indicates threshold evasion to bypass executive sign-off.`
    };
  }

  if (vendorLower.includes('shadowcorp') || (transaction.amount >= 100000 && transaction.amount % 10000 === 0 && (transaction.paymentMode === 'Crypto Wallet' || transaction.category === 'Miscellaneous'))) {
    return {
      riskScore: "High",
      flagType: "Unusual-Vendor",
      reasoning: `A substantial round payment of ₹${transaction.amount.toLocaleString('en-IN')} was initiated via ${transaction.paymentMode} to an unfamiliar vendor (${transaction.vendor}). The lack of prior transaction history and generic invoice description poses elevated financial risk.`
    };
  }

  if (vendorScore < 70) {
    return {
      riskScore: "Medium",
      flagType: "Unusual-Vendor",
      reasoning: `Vendor ${transaction.vendor} currently holds a reduced Trust Score of ${vendorScore}/100 due to past flagged anomalies. Additional review is required for new disbursements.`
    };
  }

  if (preFlagReason && preFlagReason.includes('timestamp flag')) {
    return {
      riskScore: "Medium",
      flagType: "Timing-Anomaly",
      reasoning: `This transaction was recorded at off-hours (${transaction.date}). While it may represent automated billing, off-hours disbursements outside normal business operations warrant secondary review.`
    };
  }

  if (preFlag) {
    return {
      riskScore: "Medium",
      flagType: "Review-Needed",
      reasoning: `Pre-filter rule triggered: ${preFlagReason}. Additional verification is recommended to ensure compliance with company spending policy.`
    };
  }

  return {
    riskScore: "Low",
    flagType: "Normal",
    reasoning: `The payment of ₹${transaction.amount.toLocaleString('en-IN')} to ${transaction.vendor} aligns with standard operating expenses for ${transaction.category}. No policy violations or anomalous patterns detected.`
  };
}

/**
 * Main AI Analysis Function
 */
async function analyzeTransaction(transaction, preFilterResult = { preFlag: false, preFlagReason: null }, vendorScore = 100) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_llm_api_key') {
    return fallbackReasoning(transaction, preFilterResult, vendorScore);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const userPrompt = `Transaction: ${JSON.stringify(transaction, null, 2)}\nPre-Filter Notes: ${preFilterResult.preFlagReason || 'None'}\nVendor Trust Score: ${vendorScore}/100`;
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text().trim();

    const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const verdict = JSON.parse(cleanedJson);

    if (verdict.riskScore && verdict.flagType && verdict.reasoning) {
      return verdict;
    }
  } catch (err) {
    console.warn(`[AIEngine] LLM API call notice: ${err.message}. Using controller heuristics.`);
  }

  return fallbackReasoning(transaction, preFilterResult, vendorScore);
}

module.exports = { analyzeTransaction, fallbackReasoning };
