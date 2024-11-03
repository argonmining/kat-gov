import { Request, Response } from 'express';
import { createProposalVote, getVotesForProposal } from '../models/ProposalVotes.js';
import { ProposalVote } from '../types/ProposalVotes.js';

export const submitProposalVote = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received payload:', req.body); // Log the payload
    const vote: Omit<ProposalVote, 'id'> = req.body;
    const newVote = await createProposalVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalVote:', error);
    res.status(500).json({ error: 'Failed to submit proposal vote' });
  }
};

export const fetchVotesForProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }
    const votes = await getVotesForProposal(proposalId);
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchVotesForProposal:', error);
    res.status(500).json({ error: 'Failed to fetch votes for proposal' });
  }
}; 