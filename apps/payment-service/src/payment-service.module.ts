import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService
import { LoggerModule, DynamicDatabaseModule } from '@app/common'; // Import DynamicDatabaseModule
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; // Keep TypeOrmModule for forFeature
import { PaymentEntity } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_TYPE: Joi.string().default('postgres'), // Ensure this is set for TypeOrmDatabaseModule
      }),
      envFilePath: './apps/payment-service/.env',
    }),
    LoggerModule,
    DynamicDatabaseModule.forRootAsync({
      dbType: 'typeorm',
      typeOrmConfig: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: configService.get<string>('DB_TYPE') as any || 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [PaymentEntity], // It's often better to list entities here for TypeORM
          // Alternatively, if you prefer autoLoadEntities or loading them in forFeature exclusively:
          // entities: [],
          // autoLoadEntities: true, // If you want TypeORM to discover entities (ensure paths are configured)
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    // TypeOrmModule.forFeature is used to register entities within the current scope.
    // If entities are provided in the forRootAsync/useFactory, forFeature might not be strictly
    // necessary here for just PaymentEntity, unless you want to inject repository for specific entities.
    // Given PaymentRepository uses @InjectRepository(PaymentEntity), TypeOrmModule.forFeature([PaymentEntity])
    // is essential for making the PaymentEntity repository available for injection.
    TypeOrmModule.forFeature([PaymentEntity]),
  ],
  controllers: [PaymentServiceController],
  providers: [PaymentServiceService, PaymentRepository],
})
export class PaymentServiceModule {}
