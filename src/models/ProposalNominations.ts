import pool from '../config/db.js';
import { ProposalNomination } from '../types/ProposalNomination.js';

export const getAllProposalNominations = async (): Promise<ProposalNomination[]> => {
  const result = await pool.query('SELECT * FROM proposal_nominations');
  return result.rows;
};

export const createProposalNomination = async (nomination: Omit<ProposalNomination, 'id' | 'nominatedAt'>): Promise<ProposalNomination> => {
  const { proposalId, hash, toAddress, amountSent, validVote } = nomination;
  const result = await pool.query(
    'INSERT INTO proposal_nominations (proposalId, hash, toAddress, amountSent, validVote, nominatedAt) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
    [proposalId, hash, toAddress, amountSent, validVote]
  );
  return result.rows[0];
};

export const updateProposalNomination = async (id: number, nominationData: Partial<ProposalNomination>): Promise<ProposalNomination> => {
  const { proposalId, hash, toAddress, amountSent, validVote } = nominationData;
  const result = await pool.query(
    'UPDATE proposal_nominations SET proposalId = COALESCE($1, proposalId), hash = COALESCE($2, hash), toAddress = COALESCE($3, toAddress), amountSent = COALESCE($4, amountSent), validVote = COALESCE($5, validVote) WHERE id = $6 RETURNING *',
    [proposalId, hash, toAddress, amountSent, validVote, id]
  );
  return result.rows[0];
};

export const deleteProposalNomination = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM proposal_nominations WHERE id = $1', [id]);
}; 