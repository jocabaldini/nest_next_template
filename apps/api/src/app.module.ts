import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3001),
        JWT_SECRET: Joi.string().min(32).required(),
        // aceita formato tipo "7d", "1h", "15m" etc (ms-style) ou número em string
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        // se você usa prisma:
        DATABASE_URL: Joi.string().required(),
        CORS_ORIGIN: Joi.string().trim().optional().invalid('*').messages({
          'any.invalid': 'CORS_ORIGIN="*" is not allowed',
        }),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
