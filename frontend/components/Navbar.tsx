
import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  available: number;
  escrow: number;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, available, escrow, onLogout, theme, onToggleTheme }) => {
  return (
    <nav className="bg-[#020617] border-b border-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">SwiftEscrow</span>
          </div>
          {user && (
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              user.role === UserRole.STORE ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            }`}>
              {user.role === UserRole.STORE ? 'Store Partner' : 'Rider Hero'}
            </div>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#0f172a] border border-slate-800 rounded-[20px] px-6 py-2 gap-6 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Available</span>
                <span className="text-lg font-black text-white tabular-nums">${available.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center">Escrow</span>
                <span className="text-lg font-black text-amber-500 tabular-nums">${escrow.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={onLogout} className="px-6 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
