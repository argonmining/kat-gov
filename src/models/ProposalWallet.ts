import pool from '../config/db.js';

export const createProposalWallet = async (address: string, encryptedPrivateKey: string): Promise<number> => {
  const result = await pool.query(
    'INSERT INTO proposal_wallets (address, encryptedPrivateKey, balance, timestamp, active) VALUES ($1, $2, 0, NOW(), TRUE) RETURNING id',
    [address, encryptedPrivateKey]
  );
  return result.rows[0].id;
}; 