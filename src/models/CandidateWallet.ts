import pool from '../config/db.js';

export interface CandidateWallet {
  id: number;
  address: string;
  encryptedPrivateKey: string;
}

export const getAllCandidateWallets = async (): Promise<CandidateWallet[]> => {
  try {
    const result = await pool.query('SELECT * FROM candidate_wallets');
    return result.rows;
  } catch (error) {
    console.error('Error fetching candidate wallets:', error);
    throw new Error('Could not fetch candidate wallets');
  }
};

export const createCandidateWallet = async (address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    const result = await pool.query(
      'INSERT INTO candidate_wallets (address, encryptedPrivateKey) VALUES ($1, $2) RETURNING *',
      [address, encryptedPrivateKey]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating candidate wallet:', error);
    throw new Error('Could not create candidate wallet');
  }
};

export const updateCandidateWallet = async (id: number, address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    const result = await pool.query(
      'UPDATE candidate_wallets SET address = $1, encryptedPrivateKey = $2 WHERE id = $3 RETURNING *',
      [address, encryptedPrivateKey, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating candidate wallet:', error);
    throw new Error('Could not update candidate wallet');
  }
};

export const deleteCandidateWallet = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM candidate_wallets WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting candidate wallet:', error);
    throw new Error('Could not delete candidate wallet');
  }
};

export const getEncryptedPrivateKey = async (walletId: number): Promise<string | null> => {
  try {
    const query = 'SELECT encryptedPrivateKey FROM candidate_wallets WHERE id = $1';
    const result = await pool.query(query, [walletId]);
    return result.rows[0]?.encryptedPrivateKey || null;
  } catch (error) {
    console.error('Error fetching encrypted private key:', error);
    throw new Error('Could not fetch encrypted private key');
  }
}; 