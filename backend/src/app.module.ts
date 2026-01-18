
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Wallet } from './entities/wallet.entity';
import { Bid } from './entities/bid.entity';

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
      synchronize: true, // Set to false in production
    }),
    // Feature modules would be imported here...
  ],
})
export class AppModule {}
