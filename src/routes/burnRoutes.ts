import express from 'express';
import { burnKRC20, burnKaspa, returnGovKaspa } from '../services/burnService.js';

const router = express.Router();

router.post('/burnkrc20', async (req, res, next) => {
  try {
    const { walletId, amount } = req.body;
    console.log(`Received request to burn KRC20 with walletId: ${walletId} and amount: ${amount}`);
    const hash = await burnKRC20(walletId, amount);
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

router.post('/burnkaspa', async (req, res, next) => {
  try {
    const { walletId, amount } = req.body;
    const hash = await burnKaspa(walletId, amount);
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

router.post('/returnkaspa', async (req, res, next) => {
  try {
    const { walletId, amount } = req.body;
    const hash = await returnGovKaspa(walletId);
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

export default router; 