import pool from '../config/db.js';
import { ProposalYesVote } from '../types/ProposalYesVote.js';

export const getAllProposalYesVotes = async (): Promise<ProposalYesVote[]> => {
  const result = await pool.query('SELECT * FROM proposal_yes_votes');
  return result.rows;
};

export const createProposalYesVote = async (vote: Omit<ProposalYesVote, 'id' | 'created'>): Promise<ProposalYesVote> => {
  const { hash, toAddress, amountSent, votesCounted, validVote } = vote;
  const result = await pool.query(
    'INSERT INTO proposal_yes_votes (created, hash, toAddress, amountSent, votesCounted, validVote) VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING *',
    [hash, toAddress, amountSent, votesCounted, validVote]
  );
  return result.rows[0];
};

export const updateProposalYesVote = async (id: number, voteData: Partial<ProposalYesVote>): Promise<ProposalYesVote> => {
  const { hash, toAddress, amountSent, votesCounted, validVote } = voteData;
  const result = await pool.query(
    'UPDATE proposal_yes_votes SET hash = COALESCE($1, hash), toAddress = COALESCE($2, toAddress), amountSent = COALESCE($3, amountSent), votesCounted = COALESCE($4, votesCounted), validVote = COALESCE($5, validVote) WHERE id = $6 RETURNING *',
    [hash, toAddress, amountSent, votesCounted, validVote, id]
  );
  return result.rows[0];
};

export const deleteProposalYesVote = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM proposal_yes_votes WHERE id = $1', [id]);
}; 