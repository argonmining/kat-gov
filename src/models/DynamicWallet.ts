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

export const getEncryptedPrivateKey = async (walletId: number): Promise<string | null> => {
  const query = 'SELECT encrypted_private_key FROM dynamic_wallets WHERE id = $1';
  const result = await pool.query(query, [walletId]);
  return result.rows[0]?.encrypted_private_key || null;
}; 