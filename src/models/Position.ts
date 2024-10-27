import pool from '../config/db';

export const getAllPositions = async () => {
  const result = await pool.query('SELECT * FROM positions');
  return result.rows;
};

export const createPosition = async (title: string, filled: boolean, elect: boolean) => {
  const result = await pool.query(
    'INSERT INTO positions (title, filled, elect) VALUES ($1, $2, $3) RETURNING *',
    [title, filled, elect]
  );
  return result.rows[0];
};

export const updatePosition = async (id: number, title: string, filled: boolean, elect: boolean) => {
  const result = await pool.query(
    'UPDATE positions SET title = $1, filled = $2, elect = $3 WHERE id = $4 RETURNING *',
    [title, filled, elect, id]
  );
  return result.rows[0];
};

export const deletePosition = async (id: number) => {
  await pool.query('DELETE FROM positions WHERE id = $1', [id]);
};

