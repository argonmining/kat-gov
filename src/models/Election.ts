// src/models/Election.ts
import pool from '../config/db.js';
import { Election } from '../types/Election.js';

export const createElection = async (election: Omit<Election, 'id'>): Promise<Election> => {
  const { title, position, status, submitdate, openvote, snapshot, closevote, winner } = election;
  const query = `
    INSERT INTO elections (title, position, status, submitdate, openvote, snapshot, closevote, winner)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [title, position, status, submitdate, openvote, snapshot, closevote, winner];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAllElections = async (): Promise<Election[]> => {
  const query = 'SELECT * FROM elections';
  const result = await pool.query(query);
  return result.rows;
};

// Implement the deleteElection function
export const deleteElection = async (id: number): Promise<void> => {
  const query = 'DELETE FROM elections WHERE id = $1';
  await pool.query(query, [id]);
};

// Additional CRUD operations can be added here
