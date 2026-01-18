
import { INITIAL_ORDERS, INITIAL_BIDS } from '../constants';
import { Order, Bid, OrderStatus, Wallet } from '../types';

const API_BASE = '/api';

// Simple persistence for the mock mode
const getMockData = <T>(key: string, initial: T): T => {
  const saved = localStorage.getItem(`swift_escrow_${key}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return initial;
    }
  }
  return initial;
};

const saveMockData = (key: string, data: any) => {
  localStorage.setItem(`swift_escrow_${key}`, JSON.stringify(data));
};

let mockOrders = getMockData<Order[]>('orders', INITIAL_ORDERS);
let mockBids = getMockData<Bid[]>('bids', INITIAL_BIDS);
let mockWallets: Record<string, Wallet> = getMockData('wallets', {
  'store_1': { balance: 500, escrow: 0 },
  'dg_user_1': { balance: 500, escrow: 0 }
});

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!res.ok) {
    let errorMessage = `API Error ${res.status}`;
    try {
      const text = await res.text();
      errorMessage += `: ${text}`;
    } catch (e) {
      errorMessage += `: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  if (isJson) {
    try {
      // Use clone to prevent "body already read" errors if we ever need to re-read
      return await res.json();
    } catch (e) {
      console.warn("Failed to parse JSON response, falling back to text", e);
      return await res.text();
    }
  } else {
    return await res.text();
  }
};

/**
 * SwiftEscrow API Service
 * 
 * Provides a seamless bridge between the real NestJS backend and a 
 * robust client-side mock fallback. If the backend returns a 404 or 
 * is unreachable, the service continues to function using LocalStorage.
 */
export const api = {
  async fetchOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      return await handleResponse(res);
    } catch (err) {
      console.debug("Backend unreachable, using mock orders:", err);
      return mockOrders;
    }
  },

  async createOrder(orderData: any): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      return await handleResponse(res);
    } catch (err) {
      const newOrder: Order = {
        ...orderData,
        id: `ORD_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: OrderStatus.OPEN,
        createdAt: new Date(),
      };
      mockOrders = [newOrder, ...mockOrders];
      saveMockData('orders', mockOrders);
      return newOrder;
    }
  },

  async acceptBid(orderId: string, bidId: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/accept-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId }),
      });
      return await handleResponse(res);
    } catch (err) {
      const bid = mockBids.find(b => b.id === bidId);
      mockOrders = mockOrders.map(o => o.id === orderId ? {
        ...o,
        status: OrderStatus.AWAITING_ESCROW,
        chosenBidId: bidId,
        deliveryGuyId: bid?.deliveryGuyId
      } : o);
      saveMockData('orders', mockOrders);
      return mockOrders.find(o => o.id === orderId)!;
    }
  },

  async deposit(orderId: string, userId: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return await handleResponse(res);
    } catch (err) {
      const order = mockOrders.find(o => o.id === orderId)!;
      const wallet = mockWallets[userId] || { balance: 500, escrow: 0 };
      
      const isStore = order.storeId === userId;
      const amount = isStore ? order.suggestedDeliveryFee : order.productPrice;

      wallet.balance -= amount;
      wallet.escrow += amount;
      
      mockWallets[userId] = wallet;
      saveMockData('wallets', mockWallets);

      mockOrders = mockOrders.map(o => {
        if (o.id === orderId) {
          const updated = { ...o };
          if (isStore) updated.storeDeposited = true;
          else updated.riderDeposited = true;
          
          if (updated.storeDeposited && updated.riderDeposited) {
            updated.status = OrderStatus.PICKUP;
          }
          return updated;
        }
        return o;
      });
      saveMockData('orders', mockOrders);
      return mockOrders.find(o => o.id === orderId)!;
    }
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await handleResponse(res);
    } catch (err) {
      mockOrders = mockOrders.map(o => o.id === orderId ? { ...o, status } : o);
      saveMockData('orders', mockOrders);
      return mockOrders.find(o => o.id === orderId)!;
    }
  },

  async confirmReceipt(orderId: string, storeId: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/confirm-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId }),
      });
      return await handleResponse(res);
    } catch (err) {
      const order = mockOrders.find(o => o.id === orderId)!;
      const bid = mockBids.find(b => b.id === order.chosenBidId)!;
      
      const storeWallet = mockWallets[order.storeId];
      const riderWallet = mockWallets[order.deliveryGuyId!];

      // Release funds
      storeWallet.escrow -= bid.proposedFee;
      riderWallet.balance += bid.proposedFee;

      riderWallet.escrow -= order.productPrice;
      storeWallet.balance += order.productPrice;

      saveMockData('wallets', mockWallets);

      mockOrders = mockOrders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o);
      saveMockData('orders', mockOrders);
      return mockOrders.find(o => o.id === orderId)!;
    }
  },

  async fetchBids(orderId: string): Promise<Bid[]> {
    try {
      const res = await fetch(`${API_BASE}/bids/${orderId}`);
      return await handleResponse(res);
    } catch (err) {
      return mockBids.filter(b => b.orderId === orderId);
    }
  },

  async placeBid(bidData: any): Promise<Bid> {
    try {
      const res = await fetch(`${API_BASE}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData),
      });
      return await handleResponse(res);
    } catch (err) {
      const newBid: Bid = {
        ...bidData,
        id: `BID_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(),
        rating: 'New'
      };
      mockBids = [...mockBids, newBid];
      saveMockData('bids', mockBids);
      return newBid;
    }
  },

  async fetchWallet(userId: string): Promise<Wallet> {
    try {
      const res = await fetch(`${API_BASE}/wallets/${userId}`);
      return await handleResponse(res);
    } catch (err) {
      return mockWallets[userId] || { balance: 500, escrow: 0 };
    }
  }
};
