import express from 'express';
import { burnKRC20, burnKaspa, dropKasGas, returnGovKaspa, burnYesWallet, burnNoWallet } from '../services/burnService.js';

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
    const { walletId } = req.body;
    const hash = await returnGovKaspa(walletId);
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

router.post('/dropkasgas', async (req, res, next) => {
  try {
    const { walletId } = req.body;
    console.log(`Received request to drop KasGas with walletId: ${walletId}`);
    const transactionId = await dropKasGas(walletId);
    res.status(200).json({ transactionId });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

router.post('/burnyeswallet', async (req, res, next) => {
  try {
    console.log('Received request to burn Yes Wallet');
    const hash = await burnYesWallet();
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

router.post('/burnnowallet', async (req, res, next) => {
  try {
    console.log('Received request to burn No Wallet');
    const hash = await burnNoWallet();
    res.status(200).json({ transactionHash: hash });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
});

export default router; 