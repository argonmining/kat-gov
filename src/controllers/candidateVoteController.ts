import { Request, Response } from 'express';
import { createCandidateVote, getVotesForCandidate } from '../models/CandidateVotes.js';
import { CandidateVote } from '../types/CandidateVote.js';

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