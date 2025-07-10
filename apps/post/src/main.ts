import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PostsModule } from './posts.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PostsModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: configService.getOrThrow('TCP_PORT') }, // Corrected to TCP_PORT
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));

  // await app.listen(configService.get('HTTP_PORT'));
  await app.startAllMicroservices();
}

bootstrap();
