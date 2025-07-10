import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, CommonJwtStrategy } from '@app/common'; // Import CommonJwtStrategy
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
// Remove AuthGuard import from @nestjs/passport if only using GlobalJwtAuthGuard from local
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt-auth.guard'; // Import new Global guard

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        // signOptions: { expiresIn: '...' }, // Not needed for validation by gateway
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        AUTH_SERVICE_URL: Joi.string().required(),
        POST_SERVICE_URL: Joi.string().required(),
        COMMENT_SERVICE_URL: Joi.string().required(),
        LIKE_SERVICE_URL: Joi.string().required(),
        PAYMENT_SERVICE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
      envFilePath: './apps/api-gateway/.env',
    }),
    LoggerModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT', 5000),
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS', 5),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    CommonJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard, // Use the new GlobalJwtAuthGuard
    },
  ],
})
export class ApiGatewayModule {}
