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
