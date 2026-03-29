import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationPipe, I18nValidationExceptionFilter } from 'nestjs-i18n';
import helmet from 'helmet';
import { AppModule } from './app.module';

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return ['http://localhost:3000']; // dev fallback

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

  // Triggers OnModuleDestroy on SIGINT/SIGTERM
  app.enableShutdownHooks();

  const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: (origin, cb) => {
      // No Origin header (curl / server-to-server / healthcheck) -> allow
      if (!origin) return cb(null, true);
      return cb(null, corsOrigin.includes(origin));
    },
    credentials: false, // Bearer token — credentials not needed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Replaces the default ValidationPipe — keeps whitelist/forbid/transform
  // and adds i18n support for DTO validation messages
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Formats validation errors using the language files
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  const rawPort = process.env.PORT ?? '3001';
  const port = Number(rawPort);

  if (Number.isNaN(port)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`[API] listening on :${port} (${process.env.NODE_ENV ?? 'undefined'})`);
}

bootstrap();
