import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { burnKRC20, burnKaspa, dropKasGas, returnGovKaspa, burnYesWallet, burnNoWallet } from '../services/burnService.js';
import { withErrorHandling } from '../utils/errorHandler.js';

const logger = createModuleLogger('burnController');

// Raw handlers without try/catch blocks
const _burnKrc20Tokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { walletId, amount } = req.body;
  logger.info({ walletId, amount }, 'Burning KRC20 tokens');
  const hash = await burnKRC20(walletId, amount);
  logger.info({ hash }, 'KRC20 tokens burned successfully');
  res.status(200).json({ transactionHash: hash });
};

const _burnKaspaTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { walletId, amount } = req.body;
  logger.info({ walletId, amount }, 'Burning KASPA');
  const hash = await burnKaspa(walletId, amount);
  logger.info({ hash }, 'KASPA burned successfully');
  res.status(200).json({ transactionHash: hash });
};

const _returnGovKaspaTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { walletId } = req.body;
  logger.info({ walletId }, 'Returning GOV KASPA');
  const hash = await returnGovKaspa(walletId);
  logger.info({ hash }, 'GOV KASPA returned successfully');
  res.status(200).json({ transactionHash: hash });
};

const _dropKasGasTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { walletId } = req.body;
  logger.info({ walletId }, 'Dropping KasGas');
  const transactionId = await dropKasGas(walletId);
  logger.info({ transactionId }, 'KasGas dropped successfully');
  res.status(200).json({ transactionId });
};

const _burnYesWalletTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Burning Yes Wallet');
  const hash = await burnYesWallet();
  logger.info({ hash }, 'Yes Wallet burned successfully');
  res.status(200).json({ transactionHash: hash });
};

const _burnNoWalletTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Burning No Wallet');
  const hash = await burnNoWallet();
  logger.info({ hash }, 'No Wallet burned successfully');
  res.status(200).json({ transactionHash: hash });
};

// Exported handlers with error handling
export const burnKrc20Tokens = withErrorHandling(_burnKrc20Tokens, logger);
export const burnKaspaTokens = withErrorHandling(_burnKaspaTokens, logger);
export const returnGovKaspaTokens = withErrorHandling(_returnGovKaspaTokens, logger);
export const dropKasGasTokens = withErrorHandling(_dropKasGasTokens, logger);
export const burnYesWalletTokens = withErrorHandling(_burnYesWalletTokens, logger);
export const burnNoWalletTokens = withErrorHandling(_burnNoWalletTokens, logger); 