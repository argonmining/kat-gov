// src/utils/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from './logger.js';

const logger = createModuleLogger('errorHandler');

export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  logger.error({
    error: err,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    ip: req.ip,
    stack: err.stack
  }, err.message || 'An error occurred');

  // Send error response
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'An error occurred',
    // Only include error details in non-production environments
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * Wraps controller handlers with standardized error handling
 * 
 * @param handler The controller handler function to wrap
 * @param loggerInstance Optional custom logger instance
 * @returns Wrapped handler with standardized error handling
 */
export const withErrorHandling = <T>(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<T>,
  loggerInstance = logger
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      loggerInstance.error({ 
        error, 
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query
      }, 'Controller error');
      next(error);
    }
  };
};

/**
 * Wraps controller handlers that don't use next for error handling
 * 
 * @param handler The controller handler function to wrap
 * @param loggerInstance Optional custom logger instance
 * @returns Wrapped handler with standardized error handling
 */
export const withDirectErrorHandling = <T>(
  handler: (req: Request, res: Response) => Promise<T>,
  loggerInstance = logger
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      loggerInstance.error({ 
        error, 
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query
      }, 'Controller error');
      
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };
};
