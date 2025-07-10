import { Module } from '@nestjs/common';
import { LikeServiceController } from './like-service.controller';
import { LikeServiceService } from './like-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, DynamicDatabaseModule } from '@app/common';
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { ClientsModule, Transport } from '@nestjs/microservices'; // Import ClientsModule & Transport
import { POST_SERVICE, COMMENT_SERVICE } from './constants/services'; // Import service constants


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
        COMMENT_SERVICE_HOST: Joi.string().required(),
        COMMENT_SERVICE_TCP_PORT: Joi.number().required(),
      }),
      envFilePath: './apps/like-service/.env',
    }),
    LoggerModule,
    ClientsModule.registerAsync([ // Register clients for Post and Comment services
      {
        name: POST_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('POST_SERVICE_HOST'),
            port: configService.getOrThrow<number>('POST_SERVICE_TCP_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: COMMENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('COMMENT_SERVICE_HOST'),
            port: configService.getOrThrow<number>('COMMENT_SERVICE_TCP_PORT'),
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
          entities: [LikeEntity], // Add LikeEntity here
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    TypeOrmModule.forFeature([LikeEntity]), // Add for repository injection
    // ClientsModule.registerAsync([...]) // For post/comment validation if implemented
import { LikeRepository } from './repositories/like.repository';

// ... (other imports remain the same)

@Module({
  // ... (imports array remains the same - TypeOrmModule.forFeature([LikeEntity]) is already there)
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
        // POST_SERVICE_HOST: Joi.string().optional(),
        // POST_SERVICE_TCP_PORT: Joi.number().optional(),
        // COMMENT_SERVICE_HOST: Joi.string().optional(),
        // COMMENT_SERVICE_TCP_PORT: Joi.number().optional(),
      }),
      envFilePath: './apps/like-service/.env',
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
          entities: [LikeEntity],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    TypeOrmModule.forFeature([LikeEntity]),
    // ClientsModule.registerAsync([...])
  ],
  controllers: [LikeServiceController],
  providers: [LikeServiceService, LikeRepository], // Added LikeRepository
})
export class LikeServiceModule {}
