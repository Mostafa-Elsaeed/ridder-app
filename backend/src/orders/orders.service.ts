
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Wallet } from '../entities/wallet.entity';
import { UserRole } from '../entities/user.entity';
import { Bid } from '../entities/bid.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({ 
      relations: ['store', 'rider', 'bids', 'bids.rider'],
      order: { createdAt: 'DESC' }
    });
  }

  async create(dto: any): Promise<Order> {
    const order = this.orderRepo.create({
      productName: dto.productName,
      productPrice: parseFloat(dto.productPrice),
      suggestedFee: parseFloat(dto.suggestedDeliveryFee),
      destination: dto.destination,
      store: { id: dto.storeId }
    });
    return await this.orderRepo.save(order);
  }

  async acceptBid(orderId: string, bidId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    const bid = await this.bidRepo.findOne({ where: { id: bidId }, relations: ['rider'] });
    
    if (!order || !bid) throw new NotFoundException('Order or Bid not found');

    order.rider = bid.rider;
    order.status = OrderStatus.AWAITING_ESCROW;
    return await this.orderRepo.save(order);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return await this.orderRepo.save(order);
  }

  async depositFunds(orderId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId }, relations: ['store', 'rider'] });
      const userWallet = await manager.findOne(Wallet, { where: { user: { id: userId } } });

      if (!order || !userWallet) throw new NotFoundException('Order or Wallet not found');

      const isStore = order.store.id === userId;
      const isRider = order.rider?.id === userId;

      if (!isStore && !isRider) throw new BadRequestException('Not authorized for this order');

      // If it's a store, they deposit the delivery fee
      // If it's a rider, they deposit the product price as collateral
      let amount = 0;
      if (isStore) {
        const bid = await manager.findOne(Bid, { where: { order: { id: orderId }, rider: { id: order.rider?.id } } });
        amount = parseFloat(bid?.proposedFee?.toString() || order.suggestedFee?.toString() || "0");
      } else {
        amount = parseFloat(order.productPrice?.toString() || "0");
      }

      const balance = parseFloat(userWallet.balance.toString());
      if (balance < amount) throw new BadRequestException(`Insufficient balance: Need ${amount}, Have ${balance}`);

      // Update balances using numeric arithmetic
      userWallet.balance = balance - amount;
      userWallet.escrow = parseFloat(userWallet.escrow.toString()) + amount;
      await manager.save(userWallet);

      if (isStore) order.storeDeposited = true;
      if (isRider) order.riderDeposited = true;

      if (order.storeDeposited && order.riderDeposited) {
        order.status = OrderStatus.PICKUP;
      }

      return await manager.save(order);
    });
  }

  async confirmReceipt(orderId: string, storeId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { 
        where: { id: orderId, store: { id: storeId } }, 
        relations: ['store', 'rider', 'store.wallet', 'rider.wallet'] 
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException(`Order status is ${order.status}, must be DELIVERED`);
      }

      const bid = await manager.findOne(Bid, { where: { order: { id: orderId }, rider: { id: order.rider.id } } });
      if (!bid) throw new NotFoundException('Winning bid not found');

      const fee = parseFloat(bid.proposedFee.toString());
      const price = parseFloat(order.productPrice.toString());

      // Release Store Escrow (Fee goes to Rider)
      order.store.wallet.escrow = parseFloat(order.store.wallet.escrow.toString()) - fee;
      order.rider.wallet.balance = parseFloat(order.rider.wallet.balance.toString()) + fee;

      // Release Rider Escrow (Collateral goes to Store)
      order.rider.wallet.escrow = parseFloat(order.rider.wallet.escrow.toString()) - price;
      order.store.wallet.balance = parseFloat(order.store.wallet.balance.toString()) + price;

      order.status = OrderStatus.COMPLETED;
      
      await manager.save(order.store.wallet);
      await manager.save(order.rider.wallet);
      return await manager.save(order);
    });
  }
}
