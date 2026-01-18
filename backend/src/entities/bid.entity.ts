
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.bids)
  order: Order;

  @ManyToOne(() => User)
  rider: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  proposedFee: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
