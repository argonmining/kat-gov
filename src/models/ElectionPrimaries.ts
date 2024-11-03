import pool from '../config/db.js';
import { ElectionPrimary } from '../types/ElectionPrimaries.js';

export const getAllElectionPrimaries = async (): Promise<ElectionPrimary[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_primaries');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election primaries:', error);
    throw new Error('Could not fetch election primaries');
  }
};

export const createElectionPrimary = async (type: number, position: number, candidates: number, status: number, snapshot: number): Promise<ElectionPrimary> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_primaries (type, position, candidates, status, snapshot) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, position, candidates, status, snapshot]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election primary:', error);
    throw new Error('Could not create election primary');
  }
};

export const updateElectionPrimary = async (id: number, type: number, position: number, candidates: number, status: number, snapshot: number): Promise<ElectionPrimary> => {
  try {
    const result = await pool.query(
      'UPDATE election_primaries SET type = $1, position = $2, candidates = $3, status = $4, snapshot = $5 WHERE id = $6 RETURNING *',
      [type, position, candidates, status, snapshot, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election primary:', error);
    throw new Error('Could not update election primary');
  }
};

export const deleteElectionPrimary = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_primaries WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election primary:', error);
    throw new Error('Could not delete election primary');
  }
}; 