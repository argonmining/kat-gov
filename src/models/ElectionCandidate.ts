import pool from '../config/db.js';
import { ElectionCandidate } from '../types/ElectionCandidate.js';

export const getAllElectionCandidates = async (): Promise<ElectionCandidate[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_candidates');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election candidates:', error);
    throw new Error('Could not fetch election candidates');
  }
};

export const createElectionCandidate = async (candidate: Omit<ElectionCandidate, 'id'>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, created, data } = candidate;
    const result = await pool.query(
      'INSERT INTO election_candidates (name, twitter, discord, telegram, created, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, twitter, discord, telegram, created, data]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election candidate:', error);
    throw new Error('Could not create election candidate');
  }
};

export const updateElectionCandidate = async (id: number, candidate: Partial<ElectionCandidate>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, data } = candidate;
    const result = await pool.query(
      'UPDATE election_candidates SET name = COALESCE($1, name), twitter = COALESCE($2, twitter), discord = COALESCE($3, discord), telegram = COALESCE($4, telegram), data = COALESCE($5, data) WHERE id = $6 RETURNING *',
      [name, twitter, discord, telegram, data, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election candidate:', error);
    throw new Error('Could not update election candidate');
  }
};

export const deleteElectionCandidate = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_candidates WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election candidate:', error);
    throw new Error('Could not delete election candidate');
  }
}; 