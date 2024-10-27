// src/models/Proposal.ts
import pool from '../config/db';
import { Proposal } from '../types/Proposal';

export const createProposal = async (proposal: Omit<Proposal, 'id'>): Promise<Proposal> => {
  const { title, subtitle, body, type, submitdate } = proposal;
  const query = `
    INSERT INTO proposals (title, subtitle, body, type, submitdate)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [title, subtitle, body, type, submitdate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Additional CRUD operations can be added here
