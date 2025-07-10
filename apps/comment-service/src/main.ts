import { NestFactory } from '@nestjs/core';
import { CommentServiceModule } from './comment-service.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(CommentServiceModule);
  app.use(cookieParser()); // Good practice, though maybe not strictly needed if no cookies set by this service

  const configService = app.get(ConfigService);
  const httpPort = configService.getOrThrow<number>('PORT');
  const tcpPort = configService.getOrThrow<number>('TCP_PORT');

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useLogger(app.get(Logger));

  await app.startAllMicroservices();
  await app.listen(httpPort);
  app.get(Logger).log(`CommentService HTTP listening on port ${httpPort}`, 'Bootstrap');
  app.get(Logger).log(`CommentService TCP microservice listening on port ${tcpPort}`, 'Bootstrap');
}
bootstrap();
