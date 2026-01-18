
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Order } from './order.entity';

export enum UserRole {
  STORE = 'STORE',
  DELIVERY = 'DELIVERY'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Password hidden by default
  password?: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Order, (order) => order.store)
  storeOrders: Order[];

  @OneToMany(() => Order, (order) => order.rider)
  deliveries: Order[];
}
