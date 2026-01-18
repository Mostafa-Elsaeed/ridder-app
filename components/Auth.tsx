
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STORE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (email === 'store@test.com' && password === 'password') {
        onLogin({ id: 'store_1', name: 'Gourmet Bakery', email: 'store@test.com', role: UserRole.STORE });
      } else if (email === 'delivery@test.com' && password === 'password') {
        onLogin({ id: 'dg_user_1', name: 'Alex Swift', email: 'delivery@test.com', role: UserRole.DELIVERY });
      } else {
        alert('Invalid credentials. Try the demo buttons below.');
      }
    } else {
      onLogin({ 
        id: Math.random().toString(36).substr(2, 9), 
        name: name || 'New User', 
        email, 
        role 
      });
    }
  };

  const loginAsStore = () => {
    onLogin({ id: 'store_1', name: 'Gourmet Bakery', email: 'store@test.com', role: UserRole.STORE });
  };

  const loginAsRider = () => {
    onLogin({ id: 'dg_user_1', name: 'Alex Swift', email: 'delivery@test.com', role: UserRole.DELIVERY });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-12">
      <div className="w-full max-w-[480px] bg-[#0f172a] p-10 md:p-12 rounded-[40px] shadow-2xl border border-slate-800/50">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 mx-auto mb-6 transform transition-transform hover:scale-105">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">SwiftEscrow</h2>
          <p className="text-slate-400 font-medium">Secure Delivery Marketplace</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-slate-900 rounded-2xl mb-10 border border-slate-800">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isLogin 
                ? 'bg-[#1e293b] text-indigo-400 shadow-lg border border-slate-700/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              !isLogin 
                ? 'bg-[#1e293b] text-indigo-400 shadow-lg border border-slate-700/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.STORE)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${role === UserRole.STORE ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700/50 text-slate-500'}`}
                  >
                    Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.DELIVERY)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${role === UserRole.DELIVERY ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700/50 text-slate-500'}`}
                  >
                    Rider
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Email Address</label>
            <input 
              required
              type="email"
              className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[20px] font-black text-lg tracking-tight shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Section */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-6">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={loginAsStore}
              className="bg-[#1e293b]/50 border border-slate-700/30 hover:bg-[#1e293b] hover:border-indigo-500/50 text-slate-400 hover:text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Demo Store
            </button>
            <button 
              onClick={loginAsRider}
              className="bg-[#1e293b]/50 border border-slate-700/30 hover:bg-[#1e293b] hover:border-emerald-500/50 text-slate-400 hover:text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Demo Rider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
