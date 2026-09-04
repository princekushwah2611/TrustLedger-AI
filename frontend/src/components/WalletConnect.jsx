import React from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';

export default function WalletConnect({ account, setAccount }) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error('Wallet connect error:', err);
      }
    } else {
      alert('MetaMask extension not detected. Demo mode will run with simulated wallet signers.');
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {account ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-mono font-bold text-emerald-800">{truncateAddress(account)}</span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shadow-emerald-200"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
