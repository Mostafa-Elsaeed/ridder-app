
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../entities/bid.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: any): Promise<Bid> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    const rider = await this.userRepo.findOne({ where: { id: dto.deliveryGuyId } });

    if (!order || !rider) throw new NotFoundException('Order or User not found');

    const bid = this.bidRepo.create({
      order,
      rider,
      proposedFee: dto.proposedFee,
      message: dto.message || 'Professional handling guaranteed.',
    });

    return await this.bidRepo.save(bid);
  }

  async findByOrder(orderId: string): Promise<Bid[]> {
    return await this.bidRepo.find({
      where: { order: { id: orderId } },
      relations: ['rider'],
    });
  }
}
