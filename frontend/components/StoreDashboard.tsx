
import React, { useState } from 'react';
import { Order, OrderStatus, Bid, User } from '../types';
import { suggestDeliveryFee, enhanceProductDescription } from '../services/geminiService';

interface StoreDashboardProps {
  currentUser: User;
  orders: Order[];
  bids: Bid[];
  onAddOrder: (order: Order) => void;
  onAcceptBid: (orderId: string, bidId: string) => void;
  onDeposit: (orderId: string) => void;
  onConfirmReceipt: (orderId: string) => void;
  onSubmitReview: (orderId: string, rating: number, text: string) => void;
}

const StoreDashboard: React.FC<StoreDashboardProps> = ({ 
  currentUser, orders, bids, onAddOrder, onAcceptBid, onDeposit, onConfirmReceipt, onSubmitReview 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '', productPrice: '', deliveryFee: '', destination: '', clientName: '', clientPhone: ''
  });
  const [reviews, setReviews] = useState<Record<string, { rating: number, text: string }>>({});

  const handleAiSuggest = async () => {
    if (!formData.productName) return;
    setIsAiLoading(true);
    try {
      const fee = await suggestDeliveryFee(parseFloat(formData.productPrice) || 0, formData.destination || "Local area");
      setFormData(prev => ({
        ...prev,
        deliveryFee: fee.toString(),
      }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      id: `ORD_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      storeId: currentUser.id, storeName: currentUser.name,
      productName: formData.productName, productPrice: parseFloat(formData.productPrice),
      suggestedDeliveryFee: parseFloat(formData.deliveryFee), status: OrderStatus.OPEN,
      description: 'Handled via SwiftEscrow trust protocol.', destination: formData.destination,
      clientName: formData.clientName, clientPhone: formData.clientPhone, createdAt: new Date()
    });
    setIsAdding(false);
    setFormData({ productName: '', productPrice: '', deliveryFee: '', destination: '', clientName: '', clientPhone: '' });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Store Dashboard</h1>
          <p className="text-slate-400 font-medium text-lg">Manage your products and secure deliveries.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Post New Request
        </button>
      </header>

      {isAdding && (
        <section className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-10 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">Post Shipment Request</h2>
            <button 
              type="button" 
              onClick={handleAiSuggest}
              disabled={isAiLoading || !formData.productName}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isAiLoading ? 'Magic Thinking...' : '✨ Magic AI Suggest'}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Product Name</label>
                <input required className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="e.g. Vintage Watch" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Product Price ($)</label>
                <input required type="number" className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="0.00" value={formData.productPrice} onChange={e => setFormData({...formData, productPrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Delivery Fee ($)</label>
                <input required type="number" className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="0.00" value={formData.deliveryFee} onChange={e => setFormData({...formData, deliveryFee: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Destination</label>
                <input required className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="Address" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Client Name</label>
                <input required className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="John Doe" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Client Phone</label>
                <input required className="w-full bg-[#1e293b] border border-slate-700/50 rounded-2xl px-6 py-5 text-white outline-none focus:border-indigo-500" placeholder="+1..." value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end items-center gap-8 pt-6 border-t border-slate-800">
              <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-16 py-4 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-600/30 transition-all active:scale-95">Create</button>
            </div>
          </form>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {orders.filter(o => o.storeId === currentUser.id).map(order => {
          const chosenBid = bids.find(b => b.id === order.chosenBidId);
          const currentRev = reviews[order.id] || { rating: 5, text: '' };

          return (
            <div key={order.id} className="bg-[#0f172a] border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col group transition-all hover:border-slate-700">
              <div className="p-10 flex-1">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{order.productName}</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{order.id}</p>
                    </div>
                  </div>
                  <div className={`px-5 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === OrderStatus.COMPLETED ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-500' :
                    order.status === OrderStatus.DELIVERED ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' :
                    'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {order.status === OrderStatus.AWAITING_ESCROW ? 'AWAITING ESCROW' : order.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Product Value</p>
                    <p className="text-4xl font-black text-white tracking-tight">${order.productPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Delivery Fee</p>
                    <p className="text-4xl font-black text-indigo-500 tracking-tight">${order.suggestedDeliveryFee.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-[#1e293b]/30 border border-slate-800/50 rounded-[32px] p-8 mb-10 space-y-6">
                  <div className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-slate-500 mt-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                      <p className="text-lg font-bold text-white leading-tight">{order.destination}</p>
                    </div>
                  </div>
                </div>

                {(order.status === OrderStatus.AWAITING_ESCROW || order.status === OrderStatus.PICKUP || order.status === OrderStatus.TRANSIT || order.status === OrderStatus.DELIVERED) && (
                  <div className="bg-amber-950/10 border border-amber-900/30 rounded-[32px] p-8 mb-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="text-amber-500 bg-amber-500/10 p-2 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </div>
                      <h4 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Escrow Hold Active</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-200/60 uppercase tracking-widest">Store Deposit (Fee):</span>
                        {order.storeDeposited ? (
                          <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-2">● Secured</span>
                        ) : (
                          <button onClick={() => onDeposit(order.id)} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-2xl font-black text-xs">Deposit Fee</button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-200/60 uppercase tracking-widest">Rider Deposit (Collateral):</span>
                        {order.riderDeposited ? (
                          <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-2">● Secured</span>
                        ) : (
                          <span className="text-xs font-black text-amber-600/50 italic uppercase">Pending...</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.status === OrderStatus.DELIVERED && (
                  <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] p-8 border-dashed mb-6">
                      <p className="text-emerald-400 font-bold text-center text-sm leading-relaxed">
                        The Rider has marked this as delivered. Please confirm receipt to release the product payment and delivery fee.
                      </p>
                    </div>
                    <button 
                      onClick={() => onConfirmReceipt(order.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-[28px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xl"
                    >
                      Confirm Delivery Received
                    </button>
                  </div>
                )}

                {order.status === OrderStatus.COMPLETED && !order.reviewSubmitted && (
                  <div className="bg-[#1e293b]/50 border border-indigo-500/30 rounded-[32px] p-8 mb-10 animate-in zoom-in-95">
                    <h4 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Rate your Courier</h4>
                    <div className="flex gap-3 mb-8">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setReviews({...reviews, [order.id]: {...currentRev, rating: s}})} className={`w-10 h-10 transition-colors ${s <= currentRev.rating ? 'text-amber-500' : 'text-slate-700'}`}>
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-5 text-white mb-8 outline-none focus:border-indigo-500 transition-all" 
                      placeholder="Comment on speed and care..." rows={3}
                      value={currentRev.text} onChange={e => setReviews({...reviews, [order.id]: {...currentRev, text: e.target.value}})}
                    />
                    <button onClick={() => onSubmitReview(order.id, currentRev.rating, currentRev.text)} className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                      Complete Transaction
                    </button>
                  </div>
                )}

                {order.status === OrderStatus.COMPLETED && order.reviewSubmitted && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-[32px] p-10 text-center mb-10">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Transaction Archived</h4>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Funds Released & Experience Rated</p>
                  </div>
                )}

                {chosenBid ? (
                  <div className="flex items-center justify-between bg-[#1e293b]/40 border border-slate-800 rounded-3xl p-6 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-black text-slate-500 border-2 border-slate-700">
                        {chosenBid.deliveryGuyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Rider</p>
                        <span className="text-lg font-black text-white">{chosenBid.deliveryGuyName}</span>
                      </div>
                    </div>
                    <button className="bg-slate-800 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Chat</button>
                  </div>
                ) : (
                  <div className="space-y-6 mt-10">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Incoming Offers ({bids.filter(b => b.orderId === order.id).length})</span>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="space-y-4">
                      {bids.filter(b => b.orderId === order.id).map(bid => (
                        <div key={bid.id} className="bg-[#1e293b]/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-500/50 transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">
                              {bid.deliveryGuyName.charAt(0)}
                            </div>
                            <span className="text-lg font-black text-white block">{bid.deliveryGuyName}</span>
                          </div>
                          <div className="flex items-center gap-8">
                            <span className="text-2xl font-black text-indigo-400">${bid.proposedFee.toFixed(2)}</span>
                            <button onClick={() => onAcceptBid(order.id, bid.id)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Accept</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreDashboard;
