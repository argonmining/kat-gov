import pool from '../config/db.js';

export interface ElectionType {
  id: number;
  name: string;
  active: boolean;
}

export const getAllElectionTypes = async (): Promise<ElectionType[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_types');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election types:', error);
    throw new Error('Could not fetch election types');
  }
};

export const createElectionType = async (name: string, active: boolean): Promise<ElectionType> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_types (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election type:', error);
    throw new Error('Could not create election type');
  }
};

export const updateElectionType = async (id: number, name: string, active: boolean): Promise<ElectionType> => {
  try {
    const result = await pool.query(
      'UPDATE election_types SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election type:', error);
    throw new Error('Could not update election type');
  }
};

export const deleteElectionType = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_types WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election type:', error);
    throw new Error('Could not delete election type');
  }
}; 