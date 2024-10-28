import pool from '../config/db.js';

export const getAllStatuses = async () => {
  const result = await pool.query('SELECT * FROM statuses');
  return result.rows;
};

export const createStatus = async (name: string, active: boolean) => {
  const result = await pool.query(
    'INSERT INTO statuses (name, active) VALUES ($1, $2) RETURNING *',
    [name, active]
  );
  return result.rows[0];
};

export const updateStatus = async (id: number, name: string, active: boolean) => {
  const result = await pool.query(
    'UPDATE statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
    [name, active, id]
  );
  return result.rows[0];
};

export const deleteStatus = async (id: number) => {
  await pool.query('DELETE FROM statuses WHERE id = $1', [id]);
};

