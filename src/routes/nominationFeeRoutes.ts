import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { getNominationFee, verifyNominationTransaction } from '../controllers/nominationFeeController.js';

const logger = createModuleLogger('nominationFeeRoutes');
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

router.get('/nominationFee', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Fetching nomination fee');
    await getNominationFee(req, res, next);
  } catch (error) {
    logger.error({ error }, 'Error fetching nomination fee');
    next(error);
  }
});

router.post('/verifyNominationTransaction', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(req.body, 'Verifying nomination transaction');
    await verifyNominationTransaction(req, res, next);
  } catch (error) {
    logger.error({ error }, 'Error verifying nomination transaction');
    next(error);
  }
});

export default router; 