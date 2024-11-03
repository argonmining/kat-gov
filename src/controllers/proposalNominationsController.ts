import { Request, Response, NextFunction } from 'express';
import { createProposalNomination, getAllProposalNominations, updateProposalNomination, deleteProposalNomination } from '../models/ProposalNominations.js';
import { ProposalNomination } from '../types/ProposalNomination.js';

export const fetchAllProposalNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nominations = await getAllProposalNominations();
    res.status(200).json(nominations);
  } catch (error) {
    console.error('Error in fetchAllProposalNominations:', error);
    next(error);
  }
};

export const submitProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nomination: Omit<ProposalNomination, 'id' | 'nominatedAt'> = req.body;
    const newNomination = await createProposalNomination(nomination);
    res.status(201).json(newNomination);
  } catch (error) {
    console.error('Error in submitProposalNomination:', error);
    next(error);
  }
};

export const modifyProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const nominationData: Partial<ProposalNomination> = req.body;
    const updatedNomination = await updateProposalNomination(id, nominationData);
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error('Error in modifyProposalNomination:', error);
    next(error);
  }
};

export const removeProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalNomination(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalNomination:', error);
    next(error);
  }
}; 