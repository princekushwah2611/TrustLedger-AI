import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('demo');

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);

    const targetEmail = loginEmail || email || 'founder@trustledger.ai';
    const targetPassword = loginPassword || password || 'demo123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('trustledger_user', JSON.stringify(data.user));
        localStorage.setItem('trustledger_token', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 lg:p-8 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10">
        
        {/* Left Side: Brand Showcase & Value Pillars (Light Gradient Theme) */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-950/40">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">TrustLedger AI</h1>
                <p className="text-xs text-emerald-300 font-semibold tracking-wide uppercase">Financial Controller Platform</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-bold leading-tight text-white">
                Autonomous Financial Oversight Secured by Blockchain
              </h2>
              <p className="text-xs leading-relaxed text-emerald-100/80">
                Continuous AI financial controller audit log, rule-based fraud detection, and immutable on-chain proof verification.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">AI Reasoning Engine</p>
                  <p className="text-[11px] text-emerald-100/70">Plain-language explanations for all flagged anomalies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Immutable Audit Trail</p>
                  <p className="text-[11px] text-emerald-100/70">Keccak256 reasoning hashes logged on Polygon Amoy.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Lock className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Multisig Approval Gate</p>
                  <p className="text-[11px] text-emerald-100/70">High-risk disbursements held pending 2-of-3 wallet signatures.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Live
            </span>
            <span>Polygon Amoy Testnet</span>
          </div>
        </div>

        {/* Right Side: Authentication Panel (Clean White Light Theme) */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header & Tab Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Sign In to Dashboard</h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                  Full Access Portal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('demo')}
                  className={`py-2.5 px-3 rounded-lg font-semibold transition ${
                    activeTab === 'demo'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Quick Demo Access
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`py-2.5 px-3 rounded-lg font-semibold transition ${
                    activeTab === 'credentials'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Corporate Sign-In
                </button>
              </div>
            </div>

            {/* TAB 1: QUICK DEMO ACCOUNTS */}
            {activeTab === 'demo' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-2">Click any account below to access the full live dashboard:</p>

                <button
                  onClick={() => handleLogin('founder@trustledger.ai', 'demo123')}
                  disabled={loading}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 p-3.5 rounded-xl text-xs transition group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs border border-emerald-200">
                      PS
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition">Prince Singh</p>
                      <p className="text-[11px] text-slate-500">Founder & CEO</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition">
                    <span>Enter Dashboard</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  onClick={() => handleLogin('cfo@trustledger.ai', 'demo123')}
                  disabled={loading}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 p-3.5 rounded-xl text-xs transition group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs border border-purple-200">
                      VM
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 group-hover:text-purple-700 transition">Vikram Mehta</p>
                      <p className="text-[11px] text-slate-500">Chief Financial Officer (Approver)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold opacity-0 group-hover:opacity-100 transition">
                    <span>Enter Dashboard</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  onClick={() => handleLogin('auditor@trustledger.ai', 'demo123')}
                  disabled={loading}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 p-3.5 rounded-xl text-xs transition group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                      AS
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition">Ananya Sharma</p>
                      <p className="text-[11px] text-slate-500">Lead External Auditor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold opacity-0 group-hover:opacity-100 transition">
                    <span>Enter Dashboard</span> <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            )}

            {/* TAB 2: FORM CREDENTIALS */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. founder@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-200 disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Entering Dashboard...' : 'Sign In to Controller Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Powered by Google Antigravity & Polygon Smart Contracts
          </div>
        </div>

      </div>
    </div>
  );
}
