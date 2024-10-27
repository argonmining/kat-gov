// src/utils/logger.ts

export const logInfo = (message: string) => {
    console.log(`[INFO] ${message}`);
  };
  
  export const logError = (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error || '');
  };
  