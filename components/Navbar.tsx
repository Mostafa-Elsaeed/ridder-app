
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">SwiftEscrow</span>
          </div>
          
          {user && (
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              user.role === UserRole.STORE 
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' 
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            }`}>
              {user.role === UserRole.STORE ? 'Store Partner' : 'Rider Hero'}
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleTheme}
              className="w-11 h-11 rounded-2xl bg-[#0f172a] border border-slate-800 text-slate-500 flex items-center justify-center hover:text-white hover:border-indigo-500/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>

            <div className="flex items-center bg-[#0f172a] border border-slate-800 rounded-[20px] px-6 py-2 gap-6 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mb-1">Available</span>
                <span className="text-lg font-black text-white tabular-nums">${available.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center mb-1">In Escrow</span>
                <span className="text-lg font-black text-amber-500 tabular-nums">${escrow.toFixed(2)}</span>
              </div>
              <svg className="w-4 h-4 text-slate-600 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-6 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
