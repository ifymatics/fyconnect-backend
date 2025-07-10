import { NestFactory, Reflector } from '@nestjs/core'; // Import Reflector
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'; // Import interceptors and pipes
import { JwtAuthGuard } from '@app/common'; // Import JwtAuthGuard

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.use(cookieParser()); // Enable cookie parsing, as JwtStrategy extracts from cookies

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); // For class-transformer usage if any in DTOs/entities returned

  // Global JwtAuthGuard will be applied via APP_GUARD in the module for proper DI and lifecycle.

  app.useLogger(app.get(Logger)); // Use Pino logger if configured

  await app.listen(port);
  app.get(Logger).log(`API Gateway listening on port ${port}`, 'Bootstrap');
}
bootstrap();
