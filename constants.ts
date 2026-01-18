
import { Order, OrderStatus } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD_1',
    storeId: 'store_1',
    storeName: 'Gourmet Bakery',
    productName: 'Custom Celebration Cake',
    productPrice: 45.00,
    suggestedDeliveryFee: 10.00,
    status: OrderStatus.OPEN,
    description: 'Fresh cream cake, handle with care. Do not tilt.',
    destination: '123 Baker Street, London',
    clientName: 'Sarah Jenkins',
    clientPhone: '+44 7700 900077',
    createdAt: new Date()
  }
];

export const INITIAL_BIDS = [
  {
    id: 'bid_1',
    orderId: 'ORD_1',
    deliveryGuyId: 'dg_1',
    deliveryGuyName: 'Alex Swift',
    proposedFee: 8.50,
    message: 'I have a chilled box for cakes.',
    timestamp: new Date(),
    rating: 'New'
  }
];
