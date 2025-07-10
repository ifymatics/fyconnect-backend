import { Module } from '@nestjs/common';
import { AdminServiceController } from './admin-service.controller';
import { AdminServiceService } from './admin-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios'; // For calling other services via HTTP

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        API_GATEWAY_URL: Joi.string().required(), // URL for the main API Gateway
        // Add other necessary service URLs if calling them directly (not via gateway)
        // AUTH_SERVICE_URL: Joi.string().optional(),
        // POST_SERVICE_URL: Joi.string().optional(),
      }),
      envFilePath: './apps/admin-service/.env',
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
    // If AdminService needs its own DB:
    // DynamicDatabaseModule.forRootAsync({ ... })
    // TypeOrmModule.forFeature([...])
  ],
  controllers: [AdminServiceController],
  providers: [AdminServiceService],
})
export class AdminServiceModule {}
