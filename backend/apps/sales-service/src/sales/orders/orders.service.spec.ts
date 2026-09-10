import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { MomoService } from '../payments/momo.service';
import { RABBITMQ_SERVICE } from '@app/common';
import { BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let rmqClient: any;

  beforeEach(async () => {
    rmqClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest
              .fn()
              .mockImplementation((callback) => callback(prismaService)),
            product: {
              findMany: jest.fn(),
            },
            order: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: MomoService,
          useValue: {
            ensureConfigured: jest.fn(),
            createPaymentUrl: jest.fn(),
          },
        },
        {
          provide: RABBITMQ_SERVICE,
          useValue: rmqClient,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if product is out of stock', async () => {
      const dto: CreateOrderDto = {
        fullName: 'Test User',
        phone: '0123456789',
        address: '123 Test St',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-1', quantity: 5 }],
      };

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Test Product',
          price: 100,
          costPrice: 50,
          stockQuantity: 2, // Only 2 in stock, but requested 5
          categoryId: 'cat-1',
          supplierId: 'sup-1',
          minStock: 1,
          imageUrl: null,
          deletedAt: null,
          promotionLinks: [],
        } as any,
      ]);

      await expect(service.createOrder('user-1', dto)).rejects.toThrow(
        new BadRequestException({
          code: 'PRODUCT_OUT_OF_STOCK',
          productId: 'prod-1',
          message: 'Sản phẩm Test Product không đủ tồn kho',
        }),
      );
    });

    it('should create order successfully and emit event', async () => {
      const dto: CreateOrderDto = {
        fullName: 'Test User',
        phone: '0123456789',
        address: '123 Test St',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-1', quantity: 1 }],
      };

      const mockOrder = { id: 'order-1', totalAmount: 100 };

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Test Product',
          price: 100,
          costPrice: 50,
          stockQuantity: 10,
          categoryId: 'cat-1',
          supplierId: 'sup-1',
          minStock: 1,
          imageUrl: null,
          deletedAt: null,
          promotionLinks: [],
        } as any,
      ]);

      jest
        .spyOn(prismaService.order, 'create')
        .mockResolvedValue(mockOrder as any);

      const result = await service.createOrder('user-1', dto);

      expect(prismaService.order.create).toHaveBeenCalled();
      expect(rmqClient.emit).toHaveBeenCalledWith('order.created', mockOrder);
      expect(result.requiresPayment).toBe(false);
    });
  });
});
