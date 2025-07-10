import { Test, TestingModule } from '@nestjs/testing';
import { PaymentServiceService, CreatePaymentDto } from './payment-service.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { NotFoundException } from '@nestjs/common';

const mockPaymentRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe('PaymentServiceService', () => {
  let service: PaymentServiceService;
  // let repository: PaymentRepository; // Not strictly needed

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentServiceService,
        { provide: PaymentRepository, useValue: mockPaymentRepository },
      ],
    }).compile();

    service = module.get<PaymentServiceService>(PaymentServiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create and return a payment', async () => {
      const createPaymentDto: CreatePaymentDto = { userId: 'user123', orderId: 'order456', amount: 100.50 };
      const expectedPayment = {
        id: 1,
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      } as PaymentEntity;

      mockPaymentRepository.create.mockResolvedValue(expectedPayment);

      const result = await service.createPayment(createPaymentDto);

      expect(mockPaymentRepository.create).toHaveBeenCalledWith({
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
      });
      expect(result).toEqual(expectedPayment);
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment if found', async () => {
      const paymentId = 1;
      const expectedPayment = { id: paymentId, amount: 50 } as PaymentEntity;
      mockPaymentRepository.findOne.mockResolvedValue(expectedPayment);

      const result = await service.getPaymentById(paymentId);
      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith(paymentId);
      expect(result).toEqual(expectedPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const paymentId = 999;
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentById(paymentId)).rejects.toThrow(NotFoundException);
    });
  });
});
