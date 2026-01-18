
import React, { useState } from 'react';
import { Order, OrderStatus, Bid, User } from '../types';

interface DeliveryDashboardProps {
  currentUser: User;
  orders: Order[];
  bids: Bid[];
  onAddBid: (bid: Bid) => void;
  onDeposit: (orderId: string) => void;
  onStepForward: (orderId: string, status: OrderStatus) => void;
  onSubmitReview: (orderId: string, rating: number, text: string) => void;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ 
  currentUser, orders, bids, onAddBid, onDeposit, onStepForward, onSubmitReview 
}) => {
  const [activeBidId, setActiveBidId] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState('');
  const [riderReviews, setRiderReviews] = useState<Record<string, { rating: number, text: string }>>({});

  const handleBidSubmit = (orderId: string) => {
    onAddBid({
      id: `BID_${Math.floor(Math.random() * 1000)}`,
      orderId, 
      deliveryGuyId: currentUser.id, 
      deliveryGuyName: currentUser.name,
      proposedFee: parseFloat(bidValue) || 0, 
      message: 'Professional handling guaranteed.',
      timestamp: new Date(), 
      rating: 'New'
    });
    setActiveBidId(null);
    setBidValue('');
  };

  const openOrders = orders.filter(o => o.status === OrderStatus.OPEN);
  const myActive = orders.filter(o => o.deliveryGuyId === currentUser.id && o.status !== OrderStatus.COMPLETED);
  const myCompleted = orders.filter(o => o.deliveryGuyId === currentUser.id && o.status === OrderStatus.COMPLETED);

  const getProgressWidth = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.AWAITING_ESCROW: return '25%';
      case OrderStatus.PICKUP: return '50%';
      case OrderStatus.TRANSIT: return '75%';
      case OrderStatus.DELIVERED: return '90%';
      case OrderStatus.COMPLETED: return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-20">
      <section>
        <div className="mb-10 px-2">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Delivery Missions</h1>
          <p className="text-slate-400 font-medium text-lg">Manage active shipments and fulfill your deliveries.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {[...myActive, ...myCompleted].map(order => {
            const bid = bids.find(b => b.id === order.chosenBidId);
            const currentRev = riderReviews[order.id] || { rating: 5, text: '' };

            return (
              <div key={order.id} className="bg-[#0f172a] border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col group transition-all hover:border-slate-700">
                <div className="p-10 flex-1">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{order.productName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{order.storeName}</span>
                        <span className="text-[10px] font-black text-amber-500">★ Store Partner</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee Reward</p>
                      <p className="text-4xl font-black text-emerald-500 tabular-nums">${bid?.proposedFee.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                      <span className={order.status === OrderStatus.AWAITING_ESCROW ? 'text-indigo-400 font-black' : ''}>Escrow</span>
                      <span className={order.status === OrderStatus.PICKUP ? 'text-indigo-400 font-black' : ''}>Pickup</span>
                      <span className={order.status === OrderStatus.TRANSIT ? 'text-indigo-400 font-black' : ''}>Transit</span>
                      <span className={order.status === OrderStatus.DELIVERED ? 'text-indigo-400 font-black' : ''}>Delivered</span>
                      <span className={order.status === OrderStatus.COMPLETED ? 'text-emerald-400 font-black' : ''}>Paid</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: getProgressWidth(order.status) }}></div>
                    </div>
                  </div>

                  {order.status === OrderStatus.AWAITING_ESCROW && (
                    <div className="bg-amber-950/10 border border-amber-900/30 rounded-[32px] p-8 flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Action Required</p>
                          <h4 className="text-lg font-black text-white">Deposit Collateral: ${order.productPrice.toFixed(2)}</h4>
                        </div>
                      </div>
                      <button onClick={() => onDeposit(order.id)} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        Secure Product
                      </button>
                    </div>
                  )}

                  {order.status === OrderStatus.PICKUP && (
                    <button onClick={() => onStepForward(order.id, OrderStatus.TRANSIT)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[28px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xl mb-8">
                      Confirm Item Pickup
                    </button>
                  )}

                  {order.status === OrderStatus.TRANSIT && (
                    <button onClick={() => onStepForward(order.id, OrderStatus.DELIVERED)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[28px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xl mb-8">
                      Mark as Delivered
                    </button>
                  )}

                  {order.status === OrderStatus.DELIVERED && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] p-8 text-center mb-8 border-dashed">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Delivery Reported</h4>
                      <p className="text-emerald-400/70 font-medium text-sm">Waiting for store to confirm and release funds.</p>
                    </div>
                  )}

                  {order.status === OrderStatus.COMPLETED && !order.riderReviewSubmitted && (
                    <div className="bg-[#1e293b]/50 border border-emerald-500/30 rounded-[32px] p-8 mb-8 animate-in zoom-in-95">
                      <h4 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Rate your Experience</h4>
                      <div className="flex gap-3 mb-8">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setRiderReviews({...riderReviews, [order.id]: {...currentRev, rating: s}})} className={`w-10 h-10 transition-colors ${s <= currentRev.rating ? 'text-amber-500' : 'text-slate-700'}`}>
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          </button>
                        ))}
                      </div>
                      <textarea 
                        className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-5 text-white mb-8 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700" 
                        placeholder="How was the store partner?" rows={3}
                        value={currentRev.text} onChange={e => setRiderReviews({...riderReviews, [order.id]: {...currentRev, text: e.target.value}})}
                      />
                      <button onClick={() => onSubmitReview(order.id, currentRev.rating, currentRev.text)} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        Review Store Partner
                      </button>
                    </div>
                  )}

                  {order.status === OrderStatus.COMPLETED && order.riderReviewSubmitted && (
                    <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-[32px] p-10 text-center mb-8">
                       <h4 className="text-2xl font-black text-indigo-400 mb-2 uppercase tracking-tight">Mission Accomplished</h4>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Funds Collected & Feedback Sent</p>
                    </div>
                  )}

                  <div className="bg-[#1e293b]/30 border border-slate-800/50 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <svg className="w-5 h-5 text-slate-500 mt-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                        <p className="text-lg font-bold text-white leading-tight">{order.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/50 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-black text-slate-400">{order.clientName?.charAt(0)}</div>
                        <span className="text-sm font-bold text-slate-300">{order.clientName}</span>
                      </div>
                      <span className="text-sm font-black text-slate-500 tracking-wider tabular-nums">{order.clientPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-12 px-2">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Job Marketplace</h2>
            <p className="text-slate-400 font-medium text-lg">Pick a job, bid your price, and start delivering.</p>
          </div>
          <div className="px-6 py-3 bg-indigo-950/40 border border-indigo-500/30 rounded-full text-xs font-black text-indigo-400 uppercase tracking-widest shadow-xl">
            {openOrders.length} New Requests
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {openOrders.map(order => {
            const myBid = bids.find(b => b.orderId === order.id && b.deliveryGuyId === currentUser.id);
            return (
              <div key={order.id} className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-10 shadow-2xl hover:border-indigo-500/50 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{order.storeName} ★ Verified</p>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-indigo-400 transition-all uppercase">{order.productName}</h3>
                  </div>
                </div>
                
                <div className="space-y-6 mb-12 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1e293b]/50 border border-slate-800/50 rounded-2xl p-5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Product Price</p>
                      <p className="text-xl font-black text-white tabular-nums">${order.productPrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-5">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Fee Goal</p>
                      <p className="text-xl font-black text-indigo-400 tabular-nums">${order.suggestedDeliveryFee.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-slate-600 mt-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    <p className="text-sm font-medium text-slate-400 line-clamp-2">{order.destination}</p>
                  </div>
                </div>

                {activeBidId === order.id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex gap-4">
                      <input 
                        type="number" 
                        className="flex-1 bg-[#1e293b] border border-indigo-500/50 rounded-2xl px-6 py-4 text-white outline-none font-black text-lg focus:border-indigo-400" 
                        placeholder="0.00" 
                        value={bidValue} 
                        onChange={e => setBidValue(e.target.value)} 
                      />
                      <button onClick={() => handleBidSubmit(order.id)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Submit Bid</button>
                    </div>
                    <button onClick={() => setActiveBidId(null)} className="w-full text-slate-500 font-black text-[10px] uppercase tracking-widest py-2">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => { setActiveBidId(order.id); setBidValue(myBid ? myBid.proposedFee.toString() : order.suggestedDeliveryFee.toString()); }} className="w-full bg-[#1e293b] border border-slate-700 hover:bg-indigo-600 hover:border-indigo-600 text-slate-400 hover:text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    {myBid ? 'Update your Offer' : 'Place Delivery Bid'}
                  </button>
                )}
                {myBid && <p className="text-center text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-4">Current Bid: ${myBid.proposedFee.toFixed(2)}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DeliveryDashboard;
