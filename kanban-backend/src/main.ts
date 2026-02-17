import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Use GCP's port if available, otherwise use 3000 for local testing
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();