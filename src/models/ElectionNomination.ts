import pool from '../config/db.js';

export const createElectionNomination = async (electionId: number, candidateId: number, amount: number, hash: string): Promise<void> => {
  const query = `
    INSERT INTO candidate_nominations (election, candidate, amt, hash, approved, valid, submitdate)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
  `;
  await pool.query(query, [electionId, candidateId, amount, hash, false, true]);
};
