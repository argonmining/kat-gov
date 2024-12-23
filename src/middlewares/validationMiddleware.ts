// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('validationMiddleware');

export const validateProposal = (req: Request, res: Response, next: NextFunction): void => {
  const { title, type } = req.body;
  logger.debug({ title, type }, 'Validating proposal request');

  if (!title || typeof title !== 'string') {
    logger.warn({ title }, 'Invalid proposal title');
    res.status(400).json({ error: 'Title is required and must be a string' });
    return;
  }
  if (!type || typeof type !== 'number') {
    logger.warn({ type }, 'Invalid proposal type');
    res.status(400).json({ error: 'Type is required and must be a number' });
    return;
  }

  logger.debug({ title, type }, 'Proposal validation successful');
  next();
};

export const validateNomination = (req: Request, res: Response, next: NextFunction): void => {
  const { amount, hash } = req.body;
  logger.debug({ amount, hash }, 'Validating nomination request');

  if (!amount || typeof amount !== 'number' || !hash || typeof hash !== 'string') {
    logger.warn({ amount, hash }, 'Invalid nomination data');
    res.status(400).json({ error: 'Invalid nomination data' });
    return;
  }

  logger.debug({ amount, hash }, 'Nomination validation successful');
  next();
};
