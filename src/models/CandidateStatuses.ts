import pool from '../config/db.js';

export const getAllCandidateStatuses = async () => {
  const result = await pool.query('SELECT * FROM candidate_statuses');
  return result.rows;
};

export const createCandidateStatus = async (name: string, active: boolean) => {
  const result = await pool.query(
    'INSERT INTO candidate_statuses (name, active) VALUES ($1, $2) RETURNING *',
    [name, active]
  );
  return result.rows[0];
};

export const updateCandidateStatus = async (id: number, name: string, active: boolean) => {
  const result = await pool.query(
    'UPDATE candidate_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
    [name, active, id]
  );
  return result.rows[0];
};

export const deleteCandidateStatus = async (id: number) => {
  await pool.query('DELETE FROM candidate_statuses WHERE id = $1', [id]);
}; 