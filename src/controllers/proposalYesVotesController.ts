import { Request, Response, NextFunction } from 'express';
import { createProposalYesVote, getAllProposalYesVotes, updateProposalYesVote, deleteProposalYesVote } from '../models/ProposalYesVotes.js';
import { ProposalYesVote } from '../types/ProposalYesVote.js';

export const fetchAllProposalYesVotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const votes = await getAllProposalYesVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchAllProposalYesVotes:', error);
    next(error);
  }
};

export const submitProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vote: Omit<ProposalYesVote, 'id' | 'created'> = req.body;
    const newVote = await createProposalYesVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalYesVote:', error);
    next(error);
  }
};

export const modifyProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const voteData: Partial<ProposalYesVote> = req.body;
    const updatedVote = await updateProposalYesVote(id, voteData);
    res.status(200).json(updatedVote);
  } catch (error) {
    console.error('Error in modifyProposalYesVote:', error);
    next(error);
  }
};

export const removeProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalYesVote(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalYesVote:', error);
    next(error);
  }
}; 