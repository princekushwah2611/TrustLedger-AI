import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import SummaryPanel from './components/SummaryPanel';
import TransactionList from './components/TransactionList';
import TransactionDetail from './components/TransactionDetail';
import AnomalyTimeline from './components/AnomalyTimeline';
import ChatPanel from './components/ChatPanel';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('trustledger_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [account, setAccount] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedTxLog, setSelectedTxLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-log');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuditLogs(data);
        if (data.length > 0 && !selectedTxLog) {
          const firstHighRisk = data.find(d => d.riskScore === 'High') || data[0];
          setSelectedTxLog(firstHighRisk);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAuditLogs();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('trustledger_user');
    localStorage.removeItem('trustledger_token');
    setCurrentUser(null);
  };

  const handleApprovalSuccess = (updatedData) => {
    setAuditLogs(prev => prev.map(log => {
      if (log.txId === updatedData.txId) {
        const updated = {
          ...log,
          approvalStatus: updatedData.approvalStatus,
          currentApprovals: updatedData.currentApprovals,
          latestApprovalTxHash: updatedData.latestApprovalTxHash
        };
        if (selectedTxLog && selectedTxLog.txId === updatedData.txId) {
          setSelectedTxLog(updated);
        }
        return updated;
      }
      return log;
    }));
  };

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white pb-12">
      {/* Light Theme Navigation Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onRefresh={fetchAuditLogs}
        loading={loading}
        account={account}
        setAccount={setAccount}
      />

      {/* Main Light Theme Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Executive Summary Cards */}
        <SummaryPanel auditLogs={auditLogs} />

        {/* 2-Column Split Core View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Spans): Live Transaction Stream & Timeline */}
          <div className="lg:col-span-7 space-y-8">
            <TransactionList
              auditLogs={auditLogs}
              onSelectTx={setSelectedTxLog}
              selectedTxId={selectedTxLog?.txId}
            />

            <AnomalyTimeline auditLogs={auditLogs} />
          </div>

          {/* Right Column (5 Spans): Detailed Controller Inspection & Conversational AI */}
          <div className="lg:col-span-5 space-y-8">
            <TransactionDetail
              transactionLog={selectedTxLog}
              account={account}
              onApprovalSuccess={handleApprovalSuccess}
            />

            <ChatPanel />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 px-4 sm:px-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Logged in as <strong className="text-slate-800 font-bold">{currentUser.name}</strong> ({currentUser.role})</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <a href="https://amoy.polygonscan.com" target="_blank" rel="noreferrer" className="hover:text-emerald-700 transition">
            Polygon Amoy Explorer
          </a>
          <span>•</span>
          <span>Solidity 0.8.20 OpenZeppelin AccessControl</span>
        </div>
      </footer>
    </div>
  );
}
