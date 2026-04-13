import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILogTransport, LogEntry, LogLevel } from './logger.interface';
import { ConsoleTransport } from './transports/console.transport';

@Injectable()
export class LoggerService {
  private readonly transports: ILogTransport[];
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.isDev = this.config.get<string>('NODE_ENV') === 'development';

    // Register transports here — add DatadogTransport, LokiTransport, etc in the future
    this.transports = [new ConsoleTransport()];
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit('info', message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit('warn', message, undefined, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.emit('error', message, error, context);
  }

  // Builds the log entry and dispatches it to all registered transports
  private emit(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (context) entry.context = context;
    if (error) entry.error = this.serializeError(error);

    for (const transport of this.transports) {
      transport.log(entry);
    }
  }

  // Extracts name, message and stack (dev only) from any thrown value
  private serializeError(error: unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(this.isDev && error.stack ? { stack: error.stack } : {}),
      };
    }

    // Handles thrown non-Error values (e.g. throw 'something')
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }
}
