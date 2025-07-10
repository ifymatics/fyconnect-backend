import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  protected readonly logger = new Logger(PaymentRepository.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentModel: Repository<PaymentEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createPaymentDto: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const newPayment = this.paymentModel.create(createPaymentDto);
    return this.paymentModel.save(newPayment);
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentModel.find();
  }

  async findOne(id: number): Promise<PaymentEntity | null> {
    return this.paymentModel.findOneBy({ id });
  }

  async update(id: number, updatePaymentDto: Partial<PaymentEntity>): Promise<PaymentEntity | null> {
    await this.paymentModel.update(id, updatePaymentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.paymentModel.delete(id);
  }

  // Example of using entityManager for more complex transactions if needed
  async findWithQueryBuilder(userId: string): Promise<PaymentEntity[]> {
    return this.entityManager
      .createQueryBuilder(PaymentEntity, 'payment')
      .where('payment.userId = :userId', { userId })
      .getMany();
  }
}
