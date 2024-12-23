import { Request, Response, NextFunction } from 'express';
import {
  createCandidateVote,
  getVotesForCandidate,
  getAllCandidateWallets,
  createCandidateWallet,
  updateCandidateWallet,
  deleteCandidateWallet,
  getAllCandidateNominations,
  createCandidateNomination,
  updateCandidateNomination,
  deleteCandidateNomination
} from '../models/candidateModels.js';
import {
  CandidateVote,
  CandidateNomination
} from '../types/candidateTypes.js';

// Candidate Votes
export const submitCandidateVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const vote: Omit<CandidateVote, 'id'> = req.body;
    const newVote = await createCandidateVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitCandidateVote:', error);
    res.status(500).json({ error: 'Failed to submit candidate vote' });
  }
};

export const fetchVotesForCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = parseInt(req.params.candidateId, 10);
    if (isNaN(candidateId)) {
      res.status(400).json({ error: 'Invalid candidate ID' });
      return;
    }
    const votes = await getVotesForCandidate(candidateId);
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchVotesForCandidate:', error);
    res.status(500).json({ error: 'Failed to fetch votes for candidate' });
  }
};

// Candidate Wallets
export const fetchAllCandidateWallets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallets = await getAllCandidateWallets();
    res.status(200).json(wallets);
  } catch (error) {
    next(error);
  }
};

export const addCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, encryptedPrivateKey } = req.body;
    const newWallet = await createCandidateWallet(address, encryptedPrivateKey);
    res.status(201).json(newWallet);
  } catch (error) {
    next(error);
  }
};

export const modifyCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { address, encryptedPrivateKey } = req.body;
    const updatedWallet = await updateCandidateWallet(id, address, encryptedPrivateKey);
    res.status(200).json(updatedWallet);
  } catch (error) {
    next(error);
  }
};

export const removeCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteCandidateWallet(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Candidate Nominations
export const fetchAllCandidateNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nominations = await getAllCandidateNominations();
    res.status(200).json(nominations);
  } catch (error) {
    console.error('Error in fetchAllCandidateNominations:', error);
    next(error);
  }
};

export const submitCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nomination: Omit<CandidateNomination, 'id' | 'nominatedAt'> = req.body;
    const newNomination = await createCandidateNomination(nomination);
    res.status(201).json(newNomination);
  } catch (error) {
    console.error('Error in submitCandidateNomination:', error);
    next(error);
  }
};

export const modifyCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const nominationData: Partial<CandidateNomination> = req.body;
    const updatedNomination = await updateCandidateNomination(id, nominationData);
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error('Error in modifyCandidateNomination:', error);
    next(error);
  }
};

export const removeCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteCandidateNomination(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeCandidateNomination:', error);
    next(error);
  }
}; 