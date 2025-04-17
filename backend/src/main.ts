import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable CORS here
    app.enableCors({
      origin: 'http://localhost:5173', // or '*' for all origins (less secure)
      credentials: true, // if you're using cookies/auth
    });

    
  await app.listen(3000);
}
bootstrap();
