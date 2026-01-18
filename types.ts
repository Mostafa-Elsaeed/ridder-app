
export enum UserRole {
  STORE = 'STORE',
  DELIVERY = 'DELIVERY'
}

export enum OrderStatus {
  OPEN = 'OPEN',
  AWAITING_ESCROW = 'AWAITING_ESCROW',
  PICKUP = 'PICKUP',
  TRANSIT = 'TRANSIT',
  DELIVERED = 'DELIVERED', // Rider marked as delivered
  COMPLETED = 'COMPLETED', // Store confirmed receipt (Funds Released)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Bid {
  id: string;
  orderId: string;
  deliveryGuyId: string;
  deliveryGuyName: string;
  proposedFee: number;
  message: string;
  timestamp: Date;
  rating?: string;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  productName: string;
  productPrice: number;
  suggestedDeliveryFee: number;
  status: OrderStatus;
  description: string;
  destination: string;
  clientName?: string;
  clientPhone?: string;
  chosenBidId?: string;
  deliveryGuyId?: string;
  storeDeposited?: boolean;
  riderDeposited?: boolean;
  // Store's review of the Rider
  rating?: number;
  reviewText?: string;
  reviewSubmitted?: boolean;
  // Rider's review of the Store
  riderRating?: number;
  riderReviewText?: string;
  riderReviewSubmitted?: boolean;
  createdAt: Date;
}

export interface Wallet {
  balance: number;
  escrow: number;
}
