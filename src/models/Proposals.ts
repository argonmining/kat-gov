import pool from '../config/db.js';
import { Proposal } from '../types/Proposals.js';

export const createProposal = async (proposal: Omit<Proposal, 'id'>): Promise<Proposal> => {
  try {
    const { title, description, body, type, submitted, reviewed, approved, passed, votesActive, openVote, closeVote, wallet, status } = proposal;
    const query = `
      INSERT INTO proposals (title, description, body, type, submitted, reviewed, approved, passed, votesActive, openVote, closeVote, wallet, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [title, description, body, type, submitted, reviewed, approved, passed, votesActive, openVote, closeVote, wallet, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw new Error('Could not create proposal');
  }
};

export const getAllProposals = async (filters: any, sort: string, limit: number, offset: number): Promise<Proposal[]> => {
  try {
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
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw new Error('Could not fetch proposals');
  }
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  try {
    const { title, description, body, type, reviewed, approved, passed, votesActive, openVote, closeVote, status } = proposal;
    const query = `
      UPDATE proposals
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          body = COALESCE($3, body),
          type = COALESCE($4, type),
          reviewed = COALESCE($5, reviewed),
          approved = COALESCE($6, approved),
          passed = COALESCE($7, passed),
          votesActive = COALESCE($8, votesActive),
          openVote = COALESCE($9, openVote),
          closeVote = COALESCE($10, closeVote),
          status = COALESCE($11, status)
      WHERE id = $12
      RETURNING *;
    `;
    const values = [title, description, body, type, reviewed, approved, passed, votesActive, openVote, closeVote, status, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating proposal:', error);
    throw new Error('Could not update proposal');
  }
};

export const deleteProposal = async (id: number): Promise<void> => {
  try {
    const query = 'DELETE FROM proposals WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error('Proposal not found');
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw new Error('Could not delete proposal');
  }
};

export const getProposalById = async (id: number): Promise<any> => {
  try {
    const query = `
      SELECT p.*, pw.address AS wallet_address
      FROM proposals p
      LEFT JOIN proposal_wallets pw ON p.wallet = pw.id
      WHERE p.id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching proposal by ID:', error);
    throw new Error('Could not fetch proposal by ID');
  }
};