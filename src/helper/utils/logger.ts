/**
 * Logger utility for test logging
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  log(message: string, level: LogLevel = LogLevel.INFO): void {
    if (this.shouldLog(level)) {
      const timestamp = this.getTimestamp();
      const prefix = this.getPrefix(level);
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  error(message: string): void {
    this.log(message, LogLevel.ERROR);
  }

  warn(message: string): void {
    this.log(message, LogLevel.WARN);
  }

  info(message: string): void {
    this.log(message, LogLevel.INFO);
  }

  debug(message: string): void {
    this.log(message, LogLevel.DEBUG);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  private getPrefix(level: LogLevel): string {
    const prefixes: Record<LogLevel, string> = {
      [LogLevel.ERROR]: '❌',
      [LogLevel.WARN]: '⚠️ ',
      [LogLevel.INFO]: '✓',
      [LogLevel.DEBUG]: '🔍',
    };
    return prefixes[level];
  }
}

export const logger = new Logger(LogLevel.INFO);
export default logger;
