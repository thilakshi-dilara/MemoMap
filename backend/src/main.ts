import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import type { Environment } from './config/environment.validation.js';
import { validateEnvironment } from './config/environment.validation.js';

async function bootstrap() {
  const environment: Environment = validateEnvironment(process.env);
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: environment.FRONTEND_ORIGIN, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('MemoMap API').setDescription('REST API for private, location-aware memories.').setVersion('v1').addBearerAuth().build());
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(environment.PORT);
}
await bootstrap();
