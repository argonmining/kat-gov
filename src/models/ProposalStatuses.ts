import pool from '../config/db.js';

export const getAllProposalStatuses = async () => {
  try {
    const result = await pool.query('SELECT * FROM proposal_statuses');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal statuses:', error);
    throw new Error('Could not fetch proposal statuses');
  }
};

export const createProposalStatus = async (name: string, active: boolean) => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal status:', error);
    throw new Error('Could not create proposal status');
  }
};

export const updateProposalStatus = async (id: number, name: string, active: boolean) => {
  try {
    const result = await pool.query(
      'UPDATE proposal_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal status:', error);
    throw new Error('Could not update proposal status');
  }
};

export const deleteProposalStatus = async (id: number) => {
  try {
    await pool.query('DELETE FROM proposal_statuses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal status:', error);
    throw new Error('Could not delete proposal status');
  }
}; 