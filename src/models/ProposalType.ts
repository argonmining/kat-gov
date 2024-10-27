import pool from '../config/db';

export const getAllProposalTypes = async () => {
  const result = await pool.query('SELECT * FROM proposal_types');
  return result.rows;
};

export const createProposalType = async (name: string, simple: boolean) => {
  const result = await pool.query(
    'INSERT INTO proposal_types (name, simple) VALUES ($1, $2) RETURNING *',
    [name, simple]
  );
  return result.rows[0];
};

export const updateProposalType = async (id: number, name: string, simple: boolean) => {
  const result = await pool.query(
    'UPDATE proposal_types SET name = $1, simple = $2 WHERE id = $3 RETURNING *',
    [name, simple, id]
  );
  return result.rows[0];
};

export const deleteProposalType = async (id: number) => {
  await pool.query('DELETE FROM proposal_types WHERE id = $1', [id]);
};

