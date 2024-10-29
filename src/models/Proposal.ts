// src/models/Proposal.ts
import pool from '../config/db.js';
import { Proposal } from '../types/Proposal.js';

export const createProposal = async (proposal: Omit<Proposal, 'id'>): Promise<Proposal> => {
  const { title, subtitle, body, type, submitdate, dynamic_wallet_id, approved, reviewed, status } = proposal;
  const query = `
    INSERT INTO proposals (title, subtitle, body, type, submitdate, dynamic_wallet_id, approved, reviewed, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [title, subtitle, body, type, submitdate, dynamic_wallet_id, approved, reviewed, status];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

export const getAllProposals = async (filters: any, sort: string, limit: number, offset: number): Promise<Proposal[]> => {
  let query = 'SELECT * FROM proposals';
  const values: any[] = [];
  const conditions: string[] = [];

  if (filters.title) {
    conditions.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${filters.title}%`);
  }
  if (filters.status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(filters.status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (sort) {
    query += ` ORDER BY ${sort}`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  const { title, subtitle, body, type, approved, reviewed, status, submitdate, openvote, snapshot, closevote } = proposal;
  const query = `
    UPDATE proposals
    SET title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        body = COALESCE($3, body),
        type = COALESCE($4, type),
        approved = COALESCE($5, approved),
        reviewed = COALESCE($6, reviewed),
        status = COALESCE($7, status),
        submitdate = COALESCE($8, submitdate),
        openvote = COALESCE($9, openvote),
        snapshot = COALESCE($10, snapshot),
        closevote = COALESCE($11, closevote)
    WHERE id = $12
    RETURNING *;
  `;
  const values = [title, subtitle, body, type, approved, reviewed, status, submitdate, openvote, snapshot, closevote, id];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteProposal = async (id: number): Promise<void> => {
  const query = 'DELETE FROM proposals WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);

  if (result.rowCount === 0) {
    throw new Error('Proposal not found');
  }
  // No return statement needed, as the function should return void
};

export const getProposalById = async (id: number): Promise<any> => {
  const query = `
    SELECT p.*, dw.wallet_address
    FROM proposals p
    LEFT JOIN dynamic_wallets dw ON p.dynamic_wallet_id = dw.id
    WHERE p.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Additional CRUD operations can be added here

