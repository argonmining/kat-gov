// src/controllers/electionVoteController.ts
import { Request, Response } from 'express';
import { createElectionVote } from '../models/ElectionVote.js';
import { ElectionVote } from '../types/ElectionVote.js';
import { getVotesForElection } from '../models/ElectionVote.js';

export const submitElectionVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const vote: Omit<ElectionVote, 'id'> = req.body;
    const newVote = await createElectionVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitElectionVote:', error);
    res.status(500).json({ error: 'Failed to submit election vote' });
  }
};

export const fetchVotesForElection = async (req: Request, res: Response): Promise<void> => {
  try {
    const electionId = parseInt(req.params.electionId, 10);
    if (isNaN(electionId)) {
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }
    const votes = await getVotesForElection(electionId);
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchVotesForElection:', error);
    res.status(500).json({ error: 'Failed to fetch votes for election' });
  }
};
