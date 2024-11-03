import pool from '../config/db.js';
import { Election } from '../types/Elections.js';

export const createElection = async (election: Omit<Election, 'id'>): Promise<Election> => {
  try {
    const { title, description, reviewed, approved, votesActive, openVote, closeVote, created } = election;
    const query = `
      INSERT INTO elections (title, description, reviewed, approved, votesActive, openVote, closeVote, created)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [title, description, reviewed, approved, votesActive, openVote, closeVote, created];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election:', error);
    throw new Error('Could not create election');
  }
};

export const getAllElections = async (): Promise<Election[]> => {
  try {
    const query = 'SELECT * FROM elections';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw new Error('Could not fetch elections');
  }
};

export const deleteElection = async (id: number): Promise<void> => {
  try {
    const query = 'DELETE FROM elections WHERE id = $1';
    await pool.query(query, [id]);
  } catch (error) {
    console.error('Error deleting election:', error);
    throw new Error('Could not delete election');
  }
}; 