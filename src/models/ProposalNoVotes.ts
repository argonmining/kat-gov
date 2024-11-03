import pool from '../config/db.js';
import { ProposalNoVote } from '../types/ProposalNoVote.js';

export const getAllProposalNoVotes = async (): Promise<ProposalNoVote[]> => {
  const result = await pool.query('SELECT * FROM proposal_no_votes');
  return result.rows;
};

export const createProposalNoVote = async (vote: Omit<ProposalNoVote, 'id' | 'created'>): Promise<ProposalNoVote> => {
  const { hash, toAddress, amountSent, votesCounted, validVote } = vote;
  const result = await pool.query(
    'INSERT INTO proposal_no_votes (created, hash, toAddress, amountSent, votesCounted, validVote) VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING *',
    [hash, toAddress, amountSent, votesCounted, validVote]
  );
  return result.rows[0];
};

export const updateProposalNoVote = async (id: number, voteData: Partial<ProposalNoVote>): Promise<ProposalNoVote> => {
  const { hash, toAddress, amountSent, votesCounted, validVote } = voteData;
  const result = await pool.query(
    'UPDATE proposal_no_votes SET hash = COALESCE($1, hash), toAddress = COALESCE($2, toAddress), amountSent = COALESCE($3, amountSent), votesCounted = COALESCE($4, votesCounted), validVote = COALESCE($5, validVote) WHERE id = $6 RETURNING *',
    [hash, toAddress, amountSent, votesCounted, validVote, id]
  );
  return result.rows[0];
};

export const deleteProposalNoVote = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM proposal_no_votes WHERE id = $1', [id]);
}; 