
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Order, OrderStatus, Bid, Wallet, User } from './types';
import { INITIAL_ORDERS, INITIAL_BIDS } from './constants';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import StoreDashboard from './components/StoreDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  
  const [wallets, setWallets] = useState<Record<UserRole, Wallet>>({
    [UserRole.STORE]: { balance: 1081.50, escrow: 0 },
    [UserRole.DELIVERY]: { balance: 510.00, escrow: 0 }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    setUser(null);
  };

  const currentWallet = user ? wallets[user.role] : { balance: 0, escrow: 0 };

  const handleAcceptBid = useCallback((orderId: string, bidId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: OrderStatus.AWAITING_ESCROW, chosenBidId: bidId, deliveryGuyId: bids.find(b => b.id === bidId)?.deliveryGuyId } 
        : o
    ));
  }, [bids]);

  const handleDeposit = useCallback((orderId: string, role: UserRole) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const order = o;
        const bid = bids.find(b => b.id === order.chosenBidId);
        const amount = role === UserRole.STORE ? (bid?.proposedFee || order.suggestedDeliveryFee) : order.productPrice;

        setWallets(prevW => ({
          ...prevW,
          [role]: {
            ...prevW[role],
            balance: prevW[role].balance - amount,
            escrow: prevW[role].escrow + amount
          }
        }));

        const updated = { ...o };
        if (role === UserRole.STORE) updated.storeDeposited = true;
        if (role === UserRole.DELIVERY) updated.riderDeposited = true;
        
        if (updated.storeDeposited && updated.riderDeposited) {
          updated.status = OrderStatus.PICKUP;
        }
        return updated;
      }
      return o;
    }));
  }, [bids]);

  const handleStepForward = useCallback((orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: nextStatus } : o
    ));
  }, []);

  const handleConfirmReceipt = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const bid = bids.find(b => b.id === order.chosenBidId);
    if (!bid) return;

    const deliveryFee = bid.proposedFee;
    const productPrice = order.productPrice;

    // RELEASE ESCROW FUNDS
    setWallets(prev => ({
      ...prev,
      [UserRole.STORE]: {
        ...prev[UserRole.STORE],
        balance: prev[UserRole.STORE].balance + productPrice,
        escrow: prev[UserRole.STORE].escrow - deliveryFee
      },
      [UserRole.DELIVERY]: {
        ...prev[UserRole.DELIVERY],
        balance: prev[UserRole.DELIVERY].balance + deliveryFee + productPrice,
        escrow: prev[UserRole.DELIVERY].escrow - productPrice
      }
    }));

    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o
    ));
  }, [orders, bids]);

  const handleSubmitReview = useCallback((orderId: string, role: UserRole, rating: number, reviewText: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (role === UserRole.STORE) {
          return { ...o, rating, reviewText, reviewSubmitted: true };
        } else {
          return { ...o, riderRating: rating, riderReviewText: reviewText, riderReviewSubmitted: true };
        }
      }
      return o;
    }));
  }, []);

  const addOrder = useCallback((newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  }, []);

  const addBid = useCallback((newBid: Bid) => {
    setBids(prev => [...prev, newBid]);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] transition-colors">
        <Navbar user={null} available={0} escrow={0} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <Navbar 
        user={user} 
        available={currentWallet.balance} 
        escrow={currentWallet.escrow} 
        onLogout={handleLogout} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />
      
      <main className="flex-1 px-4 md:px-8 py-10">
        {user.role === UserRole.STORE ? (
          <StoreDashboard 
            currentUser={user}
            orders={orders} 
            bids={bids} 
            onAddOrder={addOrder} 
            onAcceptBid={handleAcceptBid} 
            onDeposit={(id) => handleDeposit(id, UserRole.STORE)}
            onConfirmReceipt={handleConfirmReceipt}
            onSubmitReview={(id, r, t) => handleSubmitReview(id, UserRole.STORE, r, t)}
          />
        ) : (
          <DeliveryDashboard 
            currentUser={user}
            orders={orders} 
            bids={bids} 
            onAddBid={addBid}
            onDeposit={(id) => handleDeposit(id, UserRole.DELIVERY)}
            onStepForward={handleStepForward}
            onSubmitReview={(id, r, t) => handleSubmitReview(id, UserRole.DELIVERY, r, t)}
          />
        )}
      </main>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-[11px] font-black uppercase tracking-[0.3em]">
        &copy; 2024 SwiftEscrow Delivery. Securely connecting stores and riders.
      </footer>
    </div>
  );
};

export default App;
