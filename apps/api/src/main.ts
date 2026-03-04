import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return ['http://localhost:3000']; // fallback dev

  const trimmed = value.trim();
  if (trimmed === '*') {
    throw new Error('CORS_ORIGIN="*" is not allowed');
  }

  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(helmet());

  // Faz o Nest reagir a SIGINT/SIGTERM e disparar OnModuleDestroy nos providers
  app.enableShutdownHooks();

  const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: (origin, cb) => {
      // Sem Origin (curl/server-to-server/healthcheck) -> permite
      if (!origin) return cb(null, true);

      // Se não configurou CORS_ORIGIN, permita apenas localhost em dev (via parseCorsOrigins)
      return cb(null, corsOrigin.includes(origin));
    },
    credentials: false, // <- importante para Bearer token
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // (Recomendado para DTOs com class-validator/class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const rawPort = process.env.PORT ?? '3001';
  const port = Number(rawPort);

  if (Number.isNaN(port)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`[API] listening on :${port} (${process.env.NODE_ENV ?? 'undefined'})`);
}

bootstrap();
