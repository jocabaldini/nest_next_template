import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

// Global module — LoggerService is available in every module without explicit import
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
