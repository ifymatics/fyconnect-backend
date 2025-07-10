import { AbstractTypeOrmEntity } from '@app/common'; // Assuming this path is correct after libs setup
import { Column, Entity } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'payments' })
export class PaymentEntity extends AbstractTypeOrmEntity {
  @Column({ type: 'uuid' }) // Assuming userId is a UUID from auth service
  userId: string;

  @Column()
  orderId: string; // Could be an ID from an order service or a unique order identifier

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId?: string; // From payment gateway

  @Column({ type: 'jsonb', nullable: true })
  paymentGatewayDetails?: any; // To store any response from payment gateway
}
