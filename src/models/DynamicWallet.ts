import pool from '../config/db.js';

export const createDynamicWallet = async (walletAddress: string, encryptedPrivateKey: string): Promise<number> => {
  const query = `
    INSERT INTO dynamic_wallets (wallet_address, encrypted_private_key)
    VALUES ($1, $2)
    RETURNING id;
  `;
  const result = await pool.query(query, [walletAddress, encryptedPrivateKey]);
  return result.rows[0].id;
}; 