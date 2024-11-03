import { Request, Response, NextFunction } from 'express';
import { createProposalNoVote, getAllProposalNoVotes, updateProposalNoVote, deleteProposalNoVote } from '../models/ProposalNoVotes.js';
import { ProposalNoVote } from '../types/ProposalNoVote.js';

export const fetchAllProposalNoVotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const votes = await getAllProposalNoVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchAllProposalNoVotes:', error);
    next(error);
  }
};

export const submitProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vote: Omit<ProposalNoVote, 'id' | 'created'> = req.body;
    const newVote = await createProposalNoVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalNoVote:', error);
    next(error);
  }
};

export const modifyProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const voteData: Partial<ProposalNoVote> = req.body;
    const updatedVote = await updateProposalNoVote(id, voteData);
    res.status(200).json(updatedVote);
  } catch (error) {
    console.error('Error in modifyProposalNoVote:', error);
    next(error);
  }
};

export const removeProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalNoVote(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalNoVote:', error);
    next(error);
  }
}; 