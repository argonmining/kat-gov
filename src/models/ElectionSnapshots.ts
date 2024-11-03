import pool from '../config/db.js';

export const getAllElectionSnapshots = async () => {
  try {
    const result = await pool.query('SELECT * FROM election_snapshots');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election snapshots:', error);
    throw new Error('Could not fetch election snapshots');
  }
};

export const createElectionSnapshot = async (electionId: number, snapshotData: string) => {
  try {
    const result = await pool.query(
      'INSERT INTO election_snapshots (election_id, snapshot_data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [electionId, snapshotData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election snapshot:', error);
    throw new Error('Could not create election snapshot');
  }
};

export const updateElectionSnapshot = async (id: number, snapshotData: string) => {
  try {
    const result = await pool.query(
      'UPDATE election_snapshots SET snapshot_data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election snapshot:', error);
    throw new Error('Could not update election snapshot');
  }
};

export const deleteElectionSnapshot = async (id: number) => {
  try {
    await pool.query('DELETE FROM election_snapshots WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election snapshot:', error);
    throw new Error('Could not delete election snapshot');
  }
}; 