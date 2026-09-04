const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const store = require('../services/store');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(422).json({ error: "Question parameter is required" });
    }

    const allVerdicts = Object.values(store.getAllVerdicts());

    // Basic summary context
    const highRiskCount = allVerdicts.filter(v => v.riskScore === 'High').length;
    const mediumRiskCount = allVerdicts.filter(v => v.riskScore === 'Medium').length;
    const vendorRiskMap = {};

    allVerdicts.forEach(v => {
      if (v.riskScore === 'High' || v.riskScore === 'Medium') {
        const vendor = v.transaction.vendor;
        vendorRiskMap[vendor] = (vendorRiskMap[vendor] || 0) + (v.riskScore === 'High' ? 2 : 1);
      }
    });

    let riskiestVendor = 'None';
    let maxRiskScore = 0;
    Object.entries(vendorRiskMap).forEach(([vendor, score]) => {
      if (score > maxRiskScore) {
        maxRiskScore = score;
        riskiestVendor = vendor;
      }
    });

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey !== 'your_llm_api_key') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are TrustLedger AI, a financial controller persona answering a founder's question about company transactions.
Context Data:
- Total transactions analyzed: ${allVerdicts.length}
- High-risk flags: ${highRiskCount}
- Medium-risk flags: ${mediumRiskCount}
- Riskiest vendor: ${riskiestVendor}
- Full records: ${JSON.stringify(allVerdicts.map(v => ({
  id: v.txId,
  vendor: v.transaction.vendor,
  amount: v.transaction.amount,
  risk: v.riskScore,
  flagType: v.flagType,
  reasoning: v.reasoning
})), null, 2)}

User Question: "${question}"

Provide a concise, direct, professional 2-3 sentence answer grounded strictly in the data provided above.`;

        const result = await model.generateContent(prompt);
        const answerText = result.response.text().trim();
        return res.json({ answer: answerText });
      } catch (err) {
        console.warn(`[AskRoute LLM Error]: ${err.message}`);
      }
    }

    // Fallback natural language answer generator
    const qLower = question.toLowerCase();
    let answer = "";

    if (qLower.includes('riskiest vendor') || qLower.includes('vendor')) {
      answer = `Based on transaction analysis, ${riskiestVendor} is your riskiest vendor with multiple flagged anomalies (including duplicate invoices and high-value payments). Total high-risk transactions stand at ${highRiskCount}.`;
    } else if (qLower.includes('high risk') || qLower.includes('flag')) {
      answer = `There are currently ${highRiskCount} High-risk and ${mediumRiskCount} Medium-risk transactions flagged across your transaction history requiring executive review or multisig approval.`;
    } else if (qLower.includes('total') || qLower.includes('amount') || qLower.includes('money')) {
      const totalFlaggedAmount = allVerdicts
        .filter(v => v.riskScore === 'High' || v.riskScore === 'Medium')
        .reduce((sum, v) => sum + v.transaction.amount, 0);
      answer = `A total of ₹${totalFlaggedAmount.toLocaleString('en-IN')} across ${highRiskCount + mediumRiskCount} transactions is currently flagged for risk verification before final settlement.`;
    } else {
      answer = `Financial Controller Summary: Reviewed ${allVerdicts.length} company transactions. Flagged ${highRiskCount} High-risk and ${mediumRiskCount} Medium-risk items. ${riskiestVendor} represents the highest vendor anomaly concentration.`;
    }

    res.json({ answer });
  } catch (err) {
    console.error("[AskRoute Error]:", err);
    res.status(500).json({ error: "Failed to answer question", details: err.message });
  }
});

module.exports = router;
