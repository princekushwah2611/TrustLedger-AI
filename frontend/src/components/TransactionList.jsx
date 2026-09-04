import React, { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Award, Layers } from 'lucide-react';

export default function TransactionList({ auditLogs = [], onSelectTx, selectedTxId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const tx = log.transaction || {};
    const matchesSearch =
      tx.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.txId).includes(searchTerm);

    const matchesRisk = riskFilter === 'ALL' || log.riskScore === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (riskScore, flagType) => {
    if (flagType === 'Structuring') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Layers className="w-3.5 h-3.5" /> Structuring (Smurfing)
        </span>
      );
    }

    switch (riskScore) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" /> High Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Low Risk
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900">Live Transaction Stream</h2>
          <p className="text-xs text-slate-500 font-medium">Continuous AI financial controller audit & vendor trust scoring</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Cards List */}
      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-medium">
            No transactions match the query.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const tx = log.transaction || {};
            const isSelected = selectedTxId === log.txId;
            const vendorScore = log.vendorTrustScore || 100;

            return (
              <div
                key={log.txId}
                onClick={() => onSelectTx(log)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                    : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:block text-xs font-mono font-bold text-slate-400">#{log.txId}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">{tx.vendor}</span>
                      
                      {/* On-Chain Vendor Trust Score Badge (F9) */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        vendorScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        vendorScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <Award className="w-3 h-3" /> Trust: {vendorScore}/100
                      </span>

                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full hidden sm:inline">
                        {tx.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{tx.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ₹{tx.amount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="hidden md:block">
                    {getRiskBadge(log.riskScore, log.flagType)}
                  </div>

                  <div>
                    {log.approvalStatus === 'Approved' ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                        Approved
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 animate-pulse">
                        Pending ({log.currentApprovals || 0}/{log.requiredApprovals})
                      </span>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
