import pool from '../config/db.js';

export const getAllProposalSnapshots = async () => {
  try {
    const result = await pool.query('SELECT * FROM proposal_snapshots');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal snapshots:', error);
    throw new Error('Could not fetch proposal snapshots');
  }
};

export const createProposalSnapshot = async (proposalId: number, snapshotData: string) => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_snapshots (proposal_id, snapshot_data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [proposalId, snapshotData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal snapshot:', error);
    throw new Error('Could not create proposal snapshot');
  }
};

export const updateProposalSnapshot = async (id: number, snapshotData: string) => {
  try {
    const result = await pool.query(
      'UPDATE proposal_snapshots SET snapshot_data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal snapshot:', error);
    throw new Error('Could not update proposal snapshot');
  }
};

export const deleteProposalSnapshot = async (id: number) => {
  try {
    await pool.query('DELETE FROM proposal_snapshots WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal snapshot:', error);
    throw new Error('Could not delete proposal snapshot');
  }
}; 