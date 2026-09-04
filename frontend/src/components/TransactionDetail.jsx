import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, CheckCircle2, Sparkles, Key, Award, AlertCircle, FileText, Scale } from 'lucide-react';

export default function TransactionDetail({ transactionLog, account, onApprovalSuccess }) {
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState(null);

  // Dispute / Override modal state (F10)
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);

  if (!transactionLog) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[380px] shadow-sm">
        <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Transaction Controller Inspection</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 font-medium">
          Select any transaction from the list to view plain-language AI reasoning, pre-filter rule notes, and on-chain blockchain proof.
        </p>
      </div>
    );
  }

  const tx = transactionLog.transaction || {};
  const isPending = transactionLog.approvalStatus === 'Pending';
  const vendorScore = transactionLog.vendorTrustScore || 100;
  const disputes = transactionLog.disputes || [];

  const handleApprove = async () => {
    setIsApproving(true);
    setApprovalError(null);

    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: transactionLog.txId,
          approverAddress: account || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (onApprovalSuccess) {
          onApprovalSuccess(data);
        }
      } else {
        setApprovalError(data.error || 'Approval failed');
      }
    } catch (err) {
      setApprovalError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setIsDisputing(true);
    try {
      const res = await fetch('/api/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: transactionLog.txId,
          newRiskLevel: 'Low',
          reason: disputeReason,
          user: account || 'Executive Founder'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowDisputeModal(false);
        setDisputeReason('');
        if (onApprovalSuccess) {
          onApprovalSuccess({ ...transactionLog, approvalStatus: 'Approved', currentApprovals: 2 });
        }
      }
    } catch (err) {
      console.error('Dispute submit error:', err);
    } finally {
      setIsDisputing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50 flex flex-col justify-between h-full space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Transaction #{transactionLog.txId}</span>
              
              {/* Vendor Trust Badge (F9) */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                vendorScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                vendorScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <Award className="w-3 h-3 inline mr-0.5" /> Trust: {vendorScore}/100
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-0.5">{tx.vendor}</h3>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-emerald-700">₹{tx.amount?.toLocaleString('en-IN')}</div>
            <span className="text-xs font-semibold text-slate-500">{tx.paymentMode}</span>
          </div>
        </div>

        {/* AI Verdict Callout Box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">AI Financial Controller Verdict</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              transactionLog.riskScore === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              transactionLog.riskScore === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {transactionLog.riskScore} Risk ({transactionLog.flagType})
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200">
            "{transactionLog.reasoning}"
          </p>

          {transactionLog.preFlagReason && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
              <span className="font-bold">Rule Pre-Filter Flag:</span> {transactionLog.preFlagReason}
            </div>
          )}
        </div>

        {/* Auditable Disputes & Overrides Side-by-Side Block (F10) */}
        {disputes.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-purple-900">
              <Scale className="w-4 h-4 text-purple-700" /> Auditable Human Override History
            </div>
            {disputes.map((d, i) => (
              <div key={i} className="bg-white p-2.5 rounded-lg border border-purple-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-purple-900">Override Reason:</span>
                  <span className="text-slate-500 font-mono text-[10px]">{d.status}</span>
                </div>
                <p className="text-slate-700 italic">"{d.reason}"</p>
                <div className="text-[10px] text-slate-500 pt-1 font-mono">
                  On-chain Override Log: {d.onChainTxHash?.slice(0, 14)}...
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Immutable On-Chain Audit Proof */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Immutable On-Chain Proof
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Polygon Amoy Testnet</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Reasoning Keccak256 Hash</span>
              <span className="text-slate-800 text-[11px] font-bold break-all">{transactionLog.onChain?.reasoningHash}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Transaction Hash</span>
                <span className="text-slate-800 text-[11px] font-bold">{transactionLog.onChain?.txHash ? `${transactionLog.onChain.txHash.slice(0, 10)}...${transactionLog.onChain.txHash.slice(-8)}` : 'On-Chain Logged'}</span>
              </div>
              {transactionLog.onChain?.explorerUrl && (
                <a
                  href={transactionLog.onChain.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-sans font-bold"
                >
                  PolygonScan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Approval & Dispute Controls */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Approval Workflow:</span>
          <span className="font-bold text-slate-900">
            {transactionLog.riskScore === 'High' ? '2-of-3 Multisig' : transactionLog.riskScore === 'Medium' ? '1 Approver Signature' : 'Auto-Approved (Low Risk)'}
          </span>
        </div>

        {approvalError && (
          <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
            {approvalError}
          </div>
        )}

        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-3 rounded-xl text-xs transition shadow-md shadow-amber-200 disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              {isApproving ? 'Signing...' : `Sign (${transactionLog.currentApprovals || 0}/${transactionLog.requiredApprovals})`}
            </button>

            {/* Raise Dispute / Human Override Button (F10) */}
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-3 rounded-xl text-xs border border-slate-300 transition"
            >
              <Scale className="w-4 h-4 text-purple-700" />
              Propose Dispute
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold py-3 px-4 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Transaction Approved & Cleared
          </div>
        )}
      </div>

      {/* Human Dispute / Override Modal (F10) */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-700" /> Propose Auditable Human Override
              </h4>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Submitting an override writes an <strong>additive, transparent record to the smart contract</strong>. Both the original AI finding and your override explanation will remain visible on-chain.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispute / Override Rationale</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Verified with executive management: emergency server migration authorized per pre-signed board resolution."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisputing || !disputeReason.trim()}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-200 disabled:opacity-50"
                >
                  {isDisputing ? 'Logging On-Chain...' : 'Submit Auditable Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
