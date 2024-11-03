import pool from '../config/db.js';
import { CandidateNomination } from '../types/CandidateNomination.js';

export const getAllCandidateNominations = async (): Promise<CandidateNomination[]> => {
  const result = await pool.query('SELECT * FROM candidate_nominations');
  return result.rows;
};

export const createCandidateNomination = async (nomination: Omit<CandidateNomination, 'id' | 'nominatedAt'>): Promise<CandidateNomination> => {
  const { candidateId, electionId } = nomination;
  const result = await pool.query(
    'INSERT INTO candidate_nominations (candidateId, electionId, nominatedAt) VALUES ($1, $2, NOW()) RETURNING *',
    [candidateId, electionId]
  );
  return result.rows[0];
};

export const updateCandidateNomination = async (id: number, nominationData: Partial<CandidateNomination>): Promise<CandidateNomination> => {
  const { candidateId, electionId } = nominationData;
  const result = await pool.query(
    'UPDATE candidate_nominations SET candidateId = COALESCE($1, candidateId), electionId = COALESCE($2, electionId) WHERE id = $3 RETURNING *',
    [candidateId, electionId, id]
  );
  return result.rows[0];
};

export const deleteCandidateNomination = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM candidate_nominations WHERE id = $1', [id]);
}; 