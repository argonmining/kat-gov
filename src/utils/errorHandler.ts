// src/utils/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'An error occurred' });
};
