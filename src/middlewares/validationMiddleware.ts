// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const validateProposal = (req: Request, res: Response, next: NextFunction): void => {
  const { title, type } = req.body;
  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required and must be a string' });
    return;
  }
  if (!type || typeof type !== 'number') {
    res.status(400).json({ error: 'Type is required and must be a number' });
    return;
  }
  next();
};

export const validateNomination = (req: Request, res: Response, next: NextFunction): void => {
  const { amount, hash } = req.body;
  if (!amount || typeof amount !== 'number' || !hash || typeof hash !== 'string') {
    res.status(400).json({ error: 'Invalid nomination data' });
    return;
  }
  next();
};
