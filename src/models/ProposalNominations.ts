import pool from '../config/db.js';
import { ProposalNomination } from '../types/ProposalNomination.js';

export const getAllProposalNominations = async (): Promise<ProposalNomination[]> => {
  const result = await pool.query('SELECT * FROM proposal_nominations');
  return result.rows;
};

export const createProposalNomination = async (nomination: Omit<ProposalNomination, 'id' | 'nominatedAt'>): Promise<ProposalNomination> => {
  const { proposalId, candidateId } = nomination;
  const result = await pool.query(
    'INSERT INTO proposal_nominations (proposalId, candidateId, nominatedAt) VALUES ($1, $2, NOW()) RETURNING *',
    [proposalId, candidateId]
  );
  return result.rows[0];
};

export const updateProposalNomination = async (id: number, nominationData: Partial<ProposalNomination>): Promise<ProposalNomination> => {
  const { proposalId, candidateId } = nominationData;
  const result = await pool.query(
    'UPDATE proposal_nominations SET proposalId = COALESCE($1, proposalId), candidateId = COALESCE($2, candidateId) WHERE id = $3 RETURNING *',
    [proposalId, candidateId, id]
  );
  return result.rows[0];
};

export const deleteProposalNomination = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM proposal_nominations WHERE id = $1', [id]);
}; 