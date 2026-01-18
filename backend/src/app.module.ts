
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Wallet } from './entities/wallet.entity';
import { Bid } from './entities/bid.entity';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { BidsController } from './bids/bids.controller';
import { BidsService } from './bids/bids.service';
import { WalletsController } from './wallets/wallets.controller';
import { WalletsService } from './wallets/wallets.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'swiftescrow',
      entities: [User, Order, Wallet, Bid],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Order, Wallet, Bid]),
  ],
  controllers: [OrdersController, BidsController, WalletsController],
  providers: [OrdersService, BidsService, WalletsService],
})
export class AppModule {}
