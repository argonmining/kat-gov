import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { burnKRC20, burnKaspa, dropKasGas, returnGovKaspa, burnYesWallet, burnNoWallet } from '../services/burnService.js';

const logger = createModuleLogger('burnRoutes');
const router = Router();

// Middleware to log route access
const logRoute = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
  }, 'Route accessed');
  next();
};

router.use(logRoute);

router.post('/burnkrc20', async (req: Request, res: Response, next: NextFunction) => {
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
});

router.post('/burnkaspa', async (req: Request, res: Response, next: NextFunction) => {
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
});

router.post('/returnkaspa', async (req: Request, res: Response, next: NextFunction) => {
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
});

router.post('/dropkasgas', async (req: Request, res: Response, next: NextFunction) => {
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
});

router.post('/burnyeswallet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Burning Yes Wallet');
    const hash = await burnYesWallet();
    logger.info({ hash }, 'Yes Wallet burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning Yes Wallet');
    next(error);
  }
});

router.post('/burnnowallet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Burning No Wallet');
    const hash = await burnNoWallet();
    logger.info({ hash }, 'No Wallet burned successfully');
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    logger.error({ error }, 'Error burning No Wallet');
    next(error);
  }
});

export default router; 