
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This matches the API_BASE = '/api' in the frontend
  app.setGlobalPrefix('api');
  app.enableCors(); // Allow frontend to communicate
  await app.listen(3000);
}
bootstrap();
