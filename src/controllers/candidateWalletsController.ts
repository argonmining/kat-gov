import { Request, Response, NextFunction } from 'express';
import { getAllCandidateWallets, createCandidateWallet, updateCandidateWallet, deleteCandidateWallet } from '../models/CandidateWallet.js';

export const fetchAllCandidateWallets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallets = await getAllCandidateWallets();
    res.status(200).json(wallets);
  } catch (error) {
    next(error);
  }
};

export const addCandidateWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, encryptedPrivateKey } = req.body;
    const newWallet = await createCandidateWallet(address, encryptedPrivateKey);
    res.status(201).json(newWallet);
  } catch (error) {
    next(error);
  }
};

export const modifyCandidateWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { address, encryptedPrivateKey } = req.body;
    const updatedWallet = await updateCandidateWallet(id, address, encryptedPrivateKey);
    res.status(200).json(updatedWallet);
  } catch (error) {
    next(error);
  }
};

export const removeCandidateWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteCandidateWallet(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
