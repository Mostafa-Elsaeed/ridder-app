
import React from 'react';
import { Wallet, UserRole } from '../types';

interface WalletViewProps {
  wallet: Wallet;
  role: UserRole;
}

const WalletView: React.FC<WalletViewProps> = ({ wallet, role }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
      <div className="p-6 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white">
        <div className="flex justify-between items-start mb-2">
          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Available Balance</p>
          <div className="px-2 py-0.5 bg-indigo-400/30 rounded-lg text-[10px] font-bold">LIVE</div>
        </div>
        <p className="text-4xl font-black">${wallet.balance.toFixed(2)}</p>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Escrow Hold</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-white">${wallet.escrow.toFixed(2)}</span>
        </div>

        <div className="space-y-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl">
            <h5 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase mb-1 tracking-tight">Trust Protocol</h5>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed italic font-medium">
              {role === UserRole.STORE 
                ? "Your delivery fees are locked. Product value is secured by the courier's deposit."
                : "You deposit the product value to start. On success, you get back your deposit + delivery fee."}
            </p>
          </div>
        </div>

        <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
          Transfer Funds
        </button>
      </div>
    </div>
  );
};

export default WalletView;
