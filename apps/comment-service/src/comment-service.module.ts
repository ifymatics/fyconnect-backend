import { Module } from '@nestjs/common';
import { CommentServiceController } from './comment-service.controller';
import { CommentServiceService } from './comment-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, DynamicDatabaseModule } from '@app/common';
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity'; // Import CommentEntity
import { ClientsModule, Transport } from '@nestjs/microservices'; // Added for inter-service communication
import { POST_SERVICE } from './constants/services'; // Added for service name constant

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
        DB_TYPE: Joi.string().default('postgres'),
        POST_SERVICE_HOST: Joi.string().required(),
        POST_SERVICE_TCP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(), // Added TCP_PORT for itself
      }),
      envFilePath: './apps/comment-service/.env',
    }),
    LoggerModule,
    ClientsModule.registerAsync([
      {
        name: POST_SERVICE,
        imports: [ConfigModule], // Make ConfigModule available
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('POST_SERVICE_HOST'),
            port: configService.getOrThrow<number>('POST_SERVICE_TCP_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    DynamicDatabaseModule.forRootAsync({
      dbType: 'typeorm',
      typeOrmConfig: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: configService.getOrThrow<string>('DB_TYPE') as any,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_NAME'),
          entities: [CommentEntity], // Add CommentEntity here
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    TypeOrmModule.forFeature([CommentEntity]), // Add for repository injection
import { CommentRepository } from './repositories/comment.repository';

// ... (other imports remain the same)

@Module({
  // ... (imports array remains the same)
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
        DB_TYPE: Joi.string().default('postgres'),
        // Add any other service-specific env vars like AUTH_HOST if needed for inter-service communication
      }),
      envFilePath: './apps/comment-service/.env',
    }),
    LoggerModule,
    DynamicDatabaseModule.forRootAsync({
      dbType: 'typeorm',
      typeOrmConfig: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: configService.getOrThrow<string>('DB_TYPE') as any,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_NAME'),
          entities: [CommentEntity], // Add CommentEntity here
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    TypeOrmModule.forFeature([CommentEntity]), // Add for repository injection
  ],
  controllers: [CommentServiceController],
  providers: [CommentServiceService, CommentRepository], // Added CommentRepository
})
export class CommentServiceModule {}
