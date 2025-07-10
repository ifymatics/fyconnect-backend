import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { PaymentServiceService, CreatePaymentDto, UpdatePaymentDto } from './payment-service.service';
import { PaymentEntity } from './entities/payment.entity';

@Controller('payments') // Changed base path to 'payments'
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    return this.paymentServiceService.createPayment(createPaymentDto);
  }

  @Get()
  findAll(): Promise<PaymentEntity[]> {
    return this.paymentServiceService.getAllPayments();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity | null> {
    return this.paymentServiceService.getPaymentById(id);
  }

  @Patch(':id/status') // Example: endpoint to update payment status
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity | null> {
    return this.paymentServiceService.updatePaymentStatus(id, updatePaymentDto);
  }

  @Post(':id/process') // Example: endpoint to trigger payment processing
  processPayment(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity> {
    return this.paymentServiceService.processPayment(id);
  }
}
