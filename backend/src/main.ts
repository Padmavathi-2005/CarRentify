import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as dns from 'node:dns';

import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10485760 }), // 10MB limit for base64 uploads
  );

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  const configService = app.get(ConfigService);

  // No global prefix here: Nginx handles '/backend/' by stripping it
  // before passing the request to this app on port 4042.

  app.useStaticAssets({
    root: join(__dirname, '..', 'public', 'images'),
    prefix: '/images/',
  });

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://carrental.sangvish.com',
    'https://www.carrental.sangvish.com',
    'http://carrental.sangvish.com',
    'http://www.carrental.sangvish.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Socket-ID',
    exposedHeaders: 'Authorization',
  });

  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
