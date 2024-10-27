// src/models/ProposalVote.ts
import pool from '../config/db';
import { ProposalVote } from '../types/ProposalVote';

export const createProposalVote = async (vote: Omit<ProposalVote, 'id'>): Promise<ProposalVote> => {
  const { amt, hash, approve, valid, proposal, submitdate } = vote;
  const query = `
    INSERT INTO proposal_votes (amt, hash, approve, valid, proposal, submitdate)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [amt, hash, approve, valid, proposal, submitdate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getVotesForProposal = async (proposalId: number): Promise<ProposalVote[]> => {
  const query = 'SELECT * FROM proposal_votes WHERE proposal = $1';
  const result = await pool.query(query, [proposalId]);
  return result.rows;
};

// Additional CRUD operations can be added here
