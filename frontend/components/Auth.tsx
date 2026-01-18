
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
      if (email === 'store@test.com') onLogin({ id: 'store_1', name: 'Gourmet Bakery', email: 'store@test.com', role: UserRole.STORE });
      else if (email === 'delivery@test.com') onLogin({ id: 'dg_user_1', name: 'Alex Swift', email: 'delivery@test.com', role: UserRole.DELIVERY });
      else alert('Try store@test.com or delivery@test.com');
    } else {
      onLogin({ id: Math.random().toString(36).substr(2, 9), name: name || 'New User', email, role });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4">
      <div className="w-full max-w-[480px] bg-[#0f172a] p-10 rounded-[40px] border border-slate-800/50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
          <h2 className="text-3xl font-black text-white">SwiftEscrow</h2>
          <p className="text-slate-500 font-medium">Split Architecture Security</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-5 py-4 text-white outline-none" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-5 py-4 text-white outline-none" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[20px] font-black text-lg transition-all">Sign In</button>
        </form>
        <div className="mt-8 grid grid-cols-2 gap-4 pt-8 border-t border-slate-800">
           <button onClick={() => onLogin({ id: 'store_1', name: 'Bakery', email: 'store@test.com', role: UserRole.STORE })} className="bg-slate-800 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase">Demo Store</button>
           <button onClick={() => onLogin({ id: 'dg_user_1', name: 'Rider', email: 'delivery@test.com', role: UserRole.DELIVERY })} className="bg-slate-800 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase">Demo Rider</button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
