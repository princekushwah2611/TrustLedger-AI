import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

export default function SummaryPanel({ auditLogs = [] }) {
  const totalCount = auditLogs.length;
  const lowCount = auditLogs.filter(l => l.riskScore === 'Low').length;
  const mediumCount = auditLogs.filter(l => l.riskScore === 'Medium').length;
  const highCount = auditLogs.filter(l => l.riskScore === 'High').length;

  const totalFlaggedAmount = auditLogs
    .filter(l => l.riskScore === 'High' || l.riskScore === 'Medium')
    .reduce((sum, l) => sum + (l.transaction?.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Transactions */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm shadow-slate-200/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Analyzed</p>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-slate-900 mt-3">{totalCount}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">100% written to smart contract</p>
      </div>

      {/* Low Risk (Auto-Approved) */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm shadow-slate-200/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Low Risk (Auto)</p>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-emerald-700 mt-3">{lowCount}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">Standard business expenses</p>
      </div>

      {/* Medium Risk */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm shadow-slate-200/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Medium Risk (1-Sig)</p>
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-amber-700 mt-3">{mediumCount}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">Policy review required</p>
      </div>

      {/* High Risk (Held Multisig) */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm shadow-slate-200/50 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">High Risk (Multisig Held)</p>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <Lock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-rose-700 mt-3">{highCount}</p>
        <p className="text-xs text-rose-800 font-bold mt-1">
          ₹{totalFlaggedAmount.toLocaleString('en-IN')} held pending multisig
        </p>
      </div>
    </div>
  );
}
