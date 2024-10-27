// src/utils/errorHandler.ts

import { Response } from 'express';

export const handleError = (res: Response, error: any, message: string = 'An error occurred') => {
  console.error('[ERROR]', message, error);
  res.status(500).json({ success: false, message });
};
