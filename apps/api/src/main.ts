/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Préfixe global (Standard REST)
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // 2. Validation Globale (Sécurité & DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés qui ne sont pas dans le DTO (Sanitization)
      forbidNonWhitelisted: true, // Rejette la requête si des propriétés inconnues sont envoyées
      transform: true, // Transforme automatiquement les payloads JSON en instances de DTO
    })
  );

  // 3. CORS (Pour autoriser le frontend Next.js plus tard)
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

