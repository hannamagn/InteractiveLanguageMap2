import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 8080; // Use PORT from the environment or default to 8080
  await app.listen(port);
}
bootstrap();