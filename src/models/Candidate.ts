// src/models/Candidate.ts
import pool from '../config/db.js';
import { Candidate } from '../types/Candidate.js';

export const createCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
  const { name, position, election } = candidate;
  const query = `
    INSERT INTO candidates (name, position, election)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [name, position, election];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAllCandidates = async (): Promise<Candidate[]> => {
  const query = 'SELECT * FROM candidates';
  const result = await pool.query(query);
  return result.rows;
};

// Additional CRUD operations can be added here

