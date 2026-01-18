
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  async findOneByUser(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });
    
    // Auto-create wallet if it doesn't exist for demo/initial purposes
    if (!wallet) {
      wallet = this.walletRepo.create({
        user: { id: userId } as any,
        balance: 500.00, // Starting balance for demo
        escrow: 0,
      });
      wallet = await this.walletRepo.save(wallet);
    }
    
    return wallet;
  }
}
