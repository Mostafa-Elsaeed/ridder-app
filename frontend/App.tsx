
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Order, OrderStatus, Bid, Wallet, User } from './types';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import StoreDashboard from './components/StoreDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, escrow: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const loadData = useCallback(async () => {
    try {
      const fetchedOrders = await api.fetchOrders();
      setOrders(fetchedOrders);
      
      if (user) {
        const fetchedWallet = await api.fetchWallet(user.id);
        setWallet(fetchedWallet);

        const allBids: Bid[] = [];
        for (const order of fetchedOrders) {
           const orderBids = await api.fetchBids(order.id);
           allBids.push(...orderBids);
        }
        setBids(allBids);
      }
    } catch (err) {
      console.debug("Sync error:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = () => {
    setUser(null);
    setWallet({ balance: 0, escrow: 0 });
  };

  const handleAcceptBid = async (orderId: string, bidId: string) => {
    const updatedOrder = await api.acceptBid(orderId, bidId);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };

  const handleDeposit = async (orderId: string) => {
    if (!user) return;
    const updatedOrder = await api.deposit(orderId, user.id);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    const updatedWallet = await api.fetchWallet(user.id);
    setWallet(updatedWallet);
  };

  const handleStepForward = async (orderId: string, nextStatus: OrderStatus) => {
    const updatedOrder = await api.updateStatus(orderId, nextStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };

  const handleConfirmReceipt = async (orderId: string) => {
    if (!user) return;
    const updatedOrder = await api.confirmReceipt(orderId, user.id);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    const updatedWallet = await api.fetchWallet(user.id);
    setWallet(updatedWallet);
  };

  const handleSubmitReview = (orderId: string, role: UserRole, rating: number, text: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return role === UserRole.STORE 
          ? { ...o, rating, reviewText: text, reviewSubmitted: true }
          : { ...o, riderRating: rating, riderReviewText: text, riderReviewSubmitted: true };
      }
      return o;
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Navbar user={null} available={0} escrow={0} onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <Navbar user={user} available={wallet.balance} escrow={wallet.escrow} onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
      <main className="flex-1 px-4 md:px-8 py-10">
        {user.role === UserRole.STORE ? (
          <StoreDashboard 
            currentUser={user} orders={orders} bids={bids} 
            onAddOrder={async data => { const c = await api.createOrder(data); setOrders(p => [c, ...p]); }} 
            onAcceptBid={handleAcceptBid} onDeposit={handleDeposit} 
            onConfirmReceipt={handleConfirmReceipt}
            onSubmitReview={(id, r, t) => handleSubmitReview(id, UserRole.STORE, r, t)}
          />
        ) : (
          <DeliveryDashboard 
            currentUser={user} orders={orders} bids={bids} 
            onAddBid={async data => { const c = await api.placeBid(data); setBids(p => [...p, c]); }}
            onDeposit={handleDeposit} onStepForward={handleStepForward}
            onSubmitReview={(id, r, t) => handleSubmitReview(id, UserRole.DELIVERY, r, t)}
          />
        )}
      </main>
      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-[11px] font-black uppercase tracking-[0.3em]">
        &copy; 2024 SwiftEscrow Delivery. Secure Protocol Isolation.
      </footer>
    </div>
  );
};

export default App;
