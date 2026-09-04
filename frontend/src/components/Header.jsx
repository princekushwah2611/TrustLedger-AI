import React from 'react';
import { Shield, RefreshCw, LogOut, Building2, ChevronDown, ShieldCheck } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Header({ currentUser, onLogout, onRefresh, loading, account, setAccount }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 mb-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Workspace Indicator */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl text-white shadow-md shadow-emerald-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">TrustLedger AI</h1>
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Autonomous Financial Controller</p>
            </div>
          </div>

          {/* SME Company Selector Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-800">Acme SME Ledger</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Action Controls & User Profile Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-2 rounded-xl transition"
            title="Refresh Ledger Stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* MetaMask Wallet Connect */}
          <WalletConnect account={account} setAccount={setAccount} />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="w-7.5 h-7.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs border border-emerald-300">
              {currentUser.initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-none">{currentUser.name}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{currentUser.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition shadow-xs"
            title="Logout of Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
