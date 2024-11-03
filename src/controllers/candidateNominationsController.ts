import { Request, Response, NextFunction } from 'express';
import { createCandidateNomination, getAllCandidateNominations, updateCandidateNomination, deleteCandidateNomination } from '../models/CandidateNominations.js';
import { CandidateNomination } from '../types/CandidateNomination.js';

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