// Defines the contract for all log transports.
// Any new transport (Datadog, Loki, etc) must implement this interface.

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string; // only in development
  };
}

export interface ILogTransport {
  log(entry: LogEntry): void;
}
