
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

  async depositFunds(orderId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId }, relations: ['store', 'rider', 'bids'] });
      const userWallet = await manager.findOne(Wallet, { where: { user: { id: userId } } });

      if (!order || !userWallet) throw new NotFoundException('Order or Wallet not found');

      const isStore = order.store.id === userId;
      const isRider = order.rider?.id === userId;

      if (!isStore && !isRider) throw new BadRequestException('Not authorized for this order');

      const bid = await manager.findOne(Bid, { where: { order: { id: orderId }, rider: { id: order.rider?.id } } });
      const amount = isStore ? (bid?.proposedFee || order.suggestedFee) : order.productPrice;

      if (userWallet.balance < amount) throw new BadRequestException('Insufficient balance');

      // Move to Escrow
      userWallet.balance = Number(userWallet.balance) - Number(amount);
      userWallet.escrow = Number(userWallet.escrow) + Number(amount);
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

      if (!order || order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException('Order must be in DELIVERED status to confirm');
      }

      const bid = await manager.findOne(Bid, { where: { order: { id: orderId }, rider: { id: order.rider.id } } });
      const fee = Number(bid.proposedFee);
      const price = Number(order.productPrice);

      // Release Store Escrow (Fee goes to Rider)
      order.store.wallet.escrow -= fee;
      order.rider.wallet.balance = Number(order.rider.wallet.balance) + fee;

      // Release Rider Escrow (Collateral goes to Store)
      order.rider.wallet.escrow -= price;
      order.store.wallet.balance = Number(order.store.wallet.balance) + price;

      order.status = OrderStatus.COMPLETED;
      
      await manager.save(order.store.wallet);
      await manager.save(order.rider.wallet);
      return await manager.save(order);
    });
  }
}
