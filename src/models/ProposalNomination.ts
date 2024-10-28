import pool from '../config/db.js';

export const createProposalNomination = async (proposalId: number, amount: number, hash: string): Promise<void> => {
  const query = `
    INSERT INTO proposal_nominations (proposal, amt, hash, approve, valid, submitdate)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `;
  await pool.query(query, [proposalId, amount, hash, false, true]);
};

