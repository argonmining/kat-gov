import pool from '../config/db.js';

export const getAllProposalTypes = async () => {
  try {
    const result = await pool.query('SELECT * FROM proposal_types');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal types:', error);
    throw new Error('Could not fetch proposal types');
  }
};

export const createProposalType = async (name: string, simpleVote: boolean) => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_types (name, simpleVote) VALUES ($1, $2) RETURNING *',
      [name, simpleVote]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal type:', error);
    throw new Error('Could not create proposal type');
  }
};

export const updateProposalType = async (id: number, name: string, simpleVote: boolean) => {
  try {
    const result = await pool.query(
      'UPDATE proposal_types SET name = $1, simpleVote = $2 WHERE id = $3 RETURNING *',
      [name, simpleVote, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal type:', error);
    throw new Error('Could not update proposal type');
  }
};

export const deleteProposalType = async (id: number) => {
  try {
    await pool.query('DELETE FROM proposal_types WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal type:', error);
    throw new Error('Could not delete proposal type');
  }
}; 