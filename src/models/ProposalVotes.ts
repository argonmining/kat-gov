import pool from '../config/db.js';
import { ProposalVote } from '../types/ProposalVotes.js';

export const createProposalVote = async (vote: Omit<ProposalVote, 'id'>): Promise<ProposalVote> => {
  try {
    const { amountSent, hash, toAddress, votesCounted, validVote, proposal_id } = vote;
    const query = `
      INSERT INTO proposal_yes_votes (amountSent, hash, toAddress, votesCounted, validVote, proposal_id, created)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [amountSent, hash, toAddress, votesCounted, validVote, proposal_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal vote:', error);
    throw new Error('Could not create proposal vote');
  }
};

export const getVotesForProposal = async (proposalId: number): Promise<ProposalVote[]> => {
  try {
    const query = 'SELECT * FROM proposal_yes_votes WHERE proposal_id = $1';
    const result = await pool.query(query, [proposalId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching votes for proposal:', error);
    throw new Error('Could not fetch votes for proposal');
  }
}; 