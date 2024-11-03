import pool from '../config/db.js';

export interface ElectionStatus {
  id: number;
  name: string;
  active: boolean;
}

export const getAllElectionStatuses = async (): Promise<ElectionStatus[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_statuses');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election statuses:', error);
    throw new Error('Could not fetch election statuses');
  }
};

export const createElectionStatus = async (name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election status:', error);
    throw new Error('Could not create election status');
  }
};

export const updateElectionStatus = async (id: number, name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    const result = await pool.query(
      'UPDATE election_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election status:', error);
    throw new Error('Could not update election status');
  }
};

export const deleteElectionStatus = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_statuses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election status:', error);
    throw new Error('Could not delete election status');
  }
}; 