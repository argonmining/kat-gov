import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { burnKRC20, burnKaspa, dropKasGas, returnGovKaspa, burnYesWallet, burnNoWallet } from '../services/burnService.js';

const logger = createModuleLogger('burnController');

export const burnKrc20Tokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletId, amount } = req.body;
    logger.info({ walletId, amount }, 'Burning KRC20 tokens');
    const hash = await burnKRC20(walletId, amount);
    logger.info({ hash }, 'KRC20 tokens burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning KRC20 tokens');
    next(error);
  }
};

export const burnKaspaTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletId, amount } = req.body;
    logger.info({ walletId, amount }, 'Burning KASPA');
    const hash = await burnKaspa(walletId, amount);
    logger.info({ hash }, 'KASPA burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning KASPA');
    next(error);
  }
};

export const returnGovKaspaTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletId } = req.body;
    logger.info({ walletId }, 'Returning GOV KASPA');
    const hash = await returnGovKaspa(walletId);
    logger.info({ hash }, 'GOV KASPA returned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error returning GOV KASPA');
    next(error);
  }
};

export const dropKasGasTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletId } = req.body;
    logger.info({ walletId }, 'Dropping KasGas');
    const transactionId = await dropKasGas(walletId);
    logger.info({ transactionId }, 'KasGas dropped successfully');
    res.status(200).json({ transactionId });
  } catch (error) {
    logger.error({ error }, 'Error dropping KasGas');
    next(error);
  }
};

export const burnYesWalletTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Burning Yes Wallet');
    const hash = await burnYesWallet();
    logger.info({ hash }, 'Yes Wallet burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning Yes Wallet');
    next(error);
  }
};

export const burnNoWalletTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Burning No Wallet');
    const hash = await burnNoWallet();
    logger.info({ hash }, 'No Wallet burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning No Wallet');
    next(error);
  }
}; 