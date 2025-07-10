import { NestFactory } from '@nestjs/core';
import { LikeServiceModule } from './like-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LikeServiceModule);
  await app.listen(3000);
}
bootstrap();
