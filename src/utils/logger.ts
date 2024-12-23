// src/utils/logger.ts

import pino from 'pino';
import process from 'process';

// Configure the logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({
      pid: process.pid,
      environment: process.env.NODE_ENV,
    }),
  },
  base: undefined,
});

// Create child loggers for different modules
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

// Export default logger for general use
export default logger;
