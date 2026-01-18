
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Bid } from './bid.entity';

export enum OrderStatus {
  OPEN = 'OPEN',
  AWAITING_ESCROW = 'AWAITING_ESCROW',
  PICKUP = 'PICKUP',
  TRANSIT = 'TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.storeOrders)
  store: User;

  @ManyToOne(() => User, (user) => user.deliveries, { nullable: true })
  rider: User;

  @Column()
  productName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  productPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  suggestedFee: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: OrderStatus;

  @Column()
  destination: string;

  @Column({ default: false })
  storeDeposited: boolean;

  @Column({ default: false })
  riderDeposited: boolean;

  @OneToMany(() => Bid, (bid) => bid.order)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;
}
