import pool from '../config/db.js';
import { ElectionPosition } from '../types/ElectionPosition.js';

export const getAllElectionPositions = async (): Promise<ElectionPosition[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_positions');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election positions:', error);
    throw new Error('Could not fetch election positions');
  }
};

export const createElectionPosition = async (title: string, description: string): Promise<ElectionPosition> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_positions (title, description, created) VALUES ($1, $2, NOW()) RETURNING *',
      [title, description]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election position:', error);
    throw new Error('Could not create election position');
  }
};

export const updateElectionPosition = async (id: number, title: string, description: string): Promise<ElectionPosition> => {
  try {
    const result = await pool.query(
      'UPDATE election_positions SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election position:', error);
    throw new Error('Could not update election position');
  }
};

export const deleteElectionPosition = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_positions WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election position:', error);
    throw new Error('Could not delete election position');
  }
}; 