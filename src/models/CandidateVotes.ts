import pool from '../config/db.js';
import { CandidateVote } from '../types/CandidateVote.js';

export const createCandidateVote = async (vote: Omit<CandidateVote, 'id'>): Promise<CandidateVote> => {
  try {
    const { amountSent, candidate_id, hash, toAddress, votesCounted, validVote } = vote;
    const query = `
      INSERT INTO candidate_votes (amountSent, candidate_id, hash, toAddress, votesCounted, validVote, created)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [amountSent, candidate_id, hash, toAddress, votesCounted, validVote];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating candidate vote:', error);
    throw new Error('Could not create candidate vote');
  }
};

export const getVotesForCandidate = async (candidateId: number): Promise<CandidateVote[]> => {
  try {
    const query = 'SELECT * FROM candidate_votes WHERE candidate_id = $1';
    const result = await pool.query(query, [candidateId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching votes for candidate:', error);
    throw new Error('Could not fetch votes for candidate');
  }
}; 