import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';

// Define DTOs for request/response if needed, or use Partial<PaymentEntity> for now
export interface CreatePaymentDto {
  userId: string;
  orderId: string;
  amount: number;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  transactionId?: string;
  paymentGatewayDetails?: any;
}

@Injectable()
export class PaymentServiceService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = {
      ...createPaymentDto,
      status: PaymentStatus.PENDING, // Default status
    };
    return this.paymentRepository.create(payment);
  }

  async getAllPayments(): Promise<PaymentEntity[]> {
    return this.paymentRepository.findAll();
  }

  async getPaymentById(id: number): Promise<PaymentEntity | null> {
    const payment = await this.paymentRepository.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updatePaymentStatus(id: number, updatePaymentDto: UpdatePaymentDto): Promise<PaymentEntity | null> {
    // Add any business logic here, e.g., can only update status if currently PENDING
    const existingPayment = await this.getPaymentById(id);
    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found to update.`);
    }
    return this.paymentRepository.update(id, updatePaymentDto);
  }

  // Placeholder for actual payment processing logic
  async processPayment(paymentId: number): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found.`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment is not in a processable state.');
    }

    // Simulate calling a payment gateway
    try {
      // const gatewayResponse = await callPaymentGateway(payment.amount, payment.orderId);
      // For now, simulate success
      const simulatedGatewayResponse = { transactionId: `txn_${Date.now()}`, success: true };

      if (simulatedGatewayResponse.success) {
        return this.updatePaymentStatus(paymentId, {
          status: PaymentStatus.COMPLETED,
          transactionId: simulatedGatewayResponse.transactionId,
          paymentGatewayDetails: simulatedGatewayResponse,
        });
      } else {
        return this.updatePaymentStatus(paymentId, {
          status: PaymentStatus.FAILED,
          paymentGatewayDetails: simulatedGatewayResponse,
        });
      }
    } catch (error) {
      this.paymentRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
        paymentGatewayDetails: { error: error.message },
      });
      throw error; // Re-throw or handle more gracefully
    }
  }
}
