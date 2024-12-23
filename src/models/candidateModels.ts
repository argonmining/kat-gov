import pool from '../config/db.js';
import {
  CandidateVote,
  CandidateNomination,
  CandidateWallet,
  CandidateStatus
} from '../types/candidateTypes.js';

// Candidate Votes
export const createCandidateVote = async (vote: Omit<CandidateVote, 'id'>): Promise<CandidateVote> => {
  try {
    const { candidateId, walletAddress, voteAmount, created } = vote;
    const result = await pool.query(
      'INSERT INTO candidate_votes (candidate_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [candidateId, walletAddress, voteAmount, created]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating candidate vote:', error);
    throw new Error('Could not create candidate vote');
  }
};

export const getVotesForCandidate = async (candidateId: number): Promise<CandidateVote[]> => {
  try {
    const result = await pool.query('SELECT * FROM candidate_votes WHERE candidate_id = $1', [candidateId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching votes for candidate:', error);
    throw new Error('Could not fetch votes for candidate');
  }
};

// Candidate Nominations
export const getAllCandidateNominations = async (): Promise<CandidateNomination[]> => {
  try {
    const result = await pool.query('SELECT * FROM candidate_nominations');
    return result.rows;
  } catch (error) {
    console.error('Error fetching candidate nominations:', error);
    throw new Error('Could not fetch candidate nominations');
  }
};

export const createCandidateNomination = async (nomination: Omit<CandidateNomination, 'id'>): Promise<CandidateNomination> => {
  try {
    const { candidateId, walletAddress, nominationAmount, created } = nomination;
    const result = await pool.query(
      'INSERT INTO candidate_nominations (candidate_id, wallet_address, nomination_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [candidateId, walletAddress, nominationAmount, created]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating candidate nomination:', error);
    throw new Error('Could not create candidate nomination');
  }
};

export const updateCandidateNomination = async (id: number, nomination: Partial<CandidateNomination>): Promise<CandidateNomination> => {
  try {
    const { nominationAmount } = nomination;
    const result = await pool.query(
      'UPDATE candidate_nominations SET nomination_amount = COALESCE($1, nomination_amount) WHERE id = $2 RETURNING *',
      [nominationAmount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating candidate nomination:', error);
    throw new Error('Could not update candidate nomination');
  }
};

export const deleteCandidateNomination = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM candidate_nominations WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting candidate nomination:', error);
    throw new Error('Could not delete candidate nomination');
  }
};

// Candidate Wallets
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
      'INSERT INTO candidate_wallets (address, encrypted_private_key) VALUES ($1, $2) RETURNING *',
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
      'UPDATE candidate_wallets SET address = $1, encrypted_private_key = $2 WHERE id = $3 RETURNING *',
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

// Candidate Statuses
export const getAllCandidateStatuses = async (): Promise<CandidateStatus[]> => {
  try {
    const result = await pool.query('SELECT * FROM candidate_statuses');
    return result.rows;
  } catch (error) {
    console.error('Error fetching candidate statuses:', error);
    throw new Error('Could not fetch candidate statuses');
  }
};

export const createCandidateStatus = async (name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    const result = await pool.query(
      'INSERT INTO candidate_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating candidate status:', error);
    throw new Error('Could not create candidate status');
  }
};

export const updateCandidateStatus = async (id: number, name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    const result = await pool.query(
      'UPDATE candidate_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating candidate status:', error);
    throw new Error('Could not update candidate status');
  }
};

export const deleteCandidateStatus = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM candidate_statuses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting candidate status:', error);
    throw new Error('Could not delete candidate status');
  }
}; 