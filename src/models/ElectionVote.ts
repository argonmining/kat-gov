// src/models/ElectionVote.ts
import pool from '../config/db.js';
import { ElectionVote } from '../types/ElectionVote.js';

export const createElectionVote = async (vote: Omit<ElectionVote, 'id'>): Promise<ElectionVote> => {
  const { amt, candidate, position, election, valid, hash, submitdate } = vote;
  const query = `
    INSERT INTO election_votes (amt, candidate, position, election, valid, hash, submitdate)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [amt, candidate, position, election, valid, hash, submitdate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getVotesForElection = async (electionId: number): Promise<ElectionVote[]> => {
  const query = 'SELECT * FROM election_votes WHERE election = $1';
  const result = await pool.query(query, [electionId]);
  return result.rows;
};

// Additional CRUD operations can be added here

