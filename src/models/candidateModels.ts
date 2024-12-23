import pool from '../config/db.js';
import { createModuleLogger } from '../utils/logger.js';
import {
  CandidateVote,
  CandidateNomination,
  CandidateWallet,
  CandidateStatus
} from '../types/candidateTypes.js';

const logger = createModuleLogger('candidateModels');

// Candidate Votes
export const createCandidateVote = async (vote: Omit<CandidateVote, 'id'>): Promise<CandidateVote> => {
  try {
    const { candidateId, walletAddress, voteAmount, created } = vote;
    logger.info({ candidateId, walletAddress, voteAmount }, 'Creating candidate vote');
    const result = await pool.query(
      'INSERT INTO candidate_votes (candidate_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [candidateId, walletAddress, voteAmount, created]
    );
    logger.debug({ id: result.rows[0].id }, 'Candidate vote created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, vote }, 'Error creating candidate vote');
    throw new Error('Could not create candidate vote');
  }
};

export const getVotesForCandidate = async (candidateId: number): Promise<CandidateVote[]> => {
  try {
    logger.info({ candidateId }, 'Fetching votes for candidate');
    const result = await pool.query('SELECT * FROM candidate_votes WHERE candidate_id = $1', [candidateId]);
    logger.debug({ count: result.rows.length }, 'Retrieved candidate votes');
    return result.rows;
  } catch (error) {
    logger.error({ error, candidateId }, 'Error fetching votes for candidate');
    throw new Error('Could not fetch votes for candidate');
  }
};

// Candidate Nominations
export const getAllCandidateNominations = async (): Promise<CandidateNomination[]> => {
  try {
    logger.info('Fetching all candidate nominations');
    const result = await pool.query('SELECT * FROM candidate_nominations');
    logger.debug({ count: result.rows.length }, 'Retrieved all candidate nominations');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate nominations');
    throw new Error('Could not fetch candidate nominations');
  }
};

export const createCandidateNomination = async (nomination: Omit<CandidateNomination, 'id'>): Promise<CandidateNomination> => {
  try {
    const { candidateId, walletAddress, nominationAmount, created } = nomination;
    logger.info({ candidateId, walletAddress, nominationAmount }, 'Creating candidate nomination');
    const result = await pool.query(
      'INSERT INTO candidate_nominations (candidate_id, wallet_address, nomination_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [candidateId, walletAddress, nominationAmount, created]
    );
    logger.debug({ id: result.rows[0].id }, 'Candidate nomination created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, nomination }, 'Error creating candidate nomination');
    throw new Error('Could not create candidate nomination');
  }
};

export const updateCandidateNomination = async (id: number, nomination: Partial<CandidateNomination>): Promise<CandidateNomination> => {
  try {
    const { nominationAmount } = nomination;
    logger.info({ id, nominationAmount }, 'Updating candidate nomination');
    const result = await pool.query(
      'UPDATE candidate_nominations SET nomination_amount = COALESCE($1, nomination_amount) WHERE id = $2 RETURNING *',
      [nominationAmount, id]
    );
    logger.debug({ id }, 'Candidate nomination updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, nomination }, 'Error updating candidate nomination');
    throw new Error('Could not update candidate nomination');
  }
};

export const deleteCandidateNomination = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate nomination');
    await pool.query('DELETE FROM candidate_nominations WHERE id = $1', [id]);
    logger.debug({ id }, 'Candidate nomination deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate nomination');
    throw new Error('Could not delete candidate nomination');
  }
};

// Candidate Wallets
export const getAllCandidateWallets = async (): Promise<CandidateWallet[]> => {
  try {
    logger.info('Fetching all candidate wallets');
    const result = await pool.query('SELECT * FROM candidate_wallets');
    logger.debug({ count: result.rows.length }, 'Retrieved all candidate wallets');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate wallets');
    throw new Error('Could not fetch candidate wallets');
  }
};

export const createCandidateWallet = async (address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    logger.info({ address }, 'Creating candidate wallet');
    const result = await pool.query(
      'INSERT INTO candidate_wallets (address, encrypted_private_key) VALUES ($1, $2) RETURNING *',
      [address, encryptedPrivateKey]
    );
    logger.debug({ id: result.rows[0].id }, 'Candidate wallet created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, address }, 'Error creating candidate wallet');
    throw new Error('Could not create candidate wallet');
  }
};

export const updateCandidateWallet = async (id: number, address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    logger.info({ id, address }, 'Updating candidate wallet');
    const result = await pool.query(
      'UPDATE candidate_wallets SET address = $1, encrypted_private_key = $2 WHERE id = $3 RETURNING *',
      [address, encryptedPrivateKey, id]
    );
    logger.debug({ id }, 'Candidate wallet updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, address }, 'Error updating candidate wallet');
    throw new Error('Could not update candidate wallet');
  }
};

export const deleteCandidateWallet = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate wallet');
    await pool.query('DELETE FROM candidate_wallets WHERE id = $1', [id]);
    logger.debug({ id }, 'Candidate wallet deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate wallet');
    throw new Error('Could not delete candidate wallet');
  }
};

// Candidate Statuses
export const getAllCandidateStatuses = async (): Promise<CandidateStatus[]> => {
  try {
    logger.info('Fetching all candidate statuses');
    const result = await pool.query('SELECT * FROM candidate_statuses');
    logger.debug({ count: result.rows.length }, 'Retrieved all candidate statuses');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate statuses');
    throw new Error('Could not fetch candidate statuses');
  }
};

export const createCandidateStatus = async (name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    logger.info({ name, active }, 'Creating candidate status');
    const result = await pool.query(
      'INSERT INTO candidate_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    logger.debug({ id: result.rows[0].id }, 'Candidate status created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating candidate status');
    throw new Error('Could not create candidate status');
  }
};

export const updateCandidateStatus = async (id: number, name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    logger.info({ id, name, active }, 'Updating candidate status');
    const result = await pool.query(
      'UPDATE candidate_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    logger.debug({ id }, 'Candidate status updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating candidate status');
    throw new Error('Could not update candidate status');
  }
};

export const deleteCandidateStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate status');
    await pool.query('DELETE FROM candidate_statuses WHERE id = $1', [id]);
    logger.debug({ id }, 'Candidate status deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate status');
    throw new Error('Could not delete candidate status');
  }
};

// Get encrypted private key for a wallet
export const getEncryptedPrivateKey = async (walletId: number): Promise<string | null> => {
  try {
    logger.info({ walletId }, 'Fetching encrypted private key');
    const result = await pool.query(
      'SELECT encrypted_private_key FROM candidate_wallets WHERE id = $1',
      [walletId]
    );
    const key = result.rows[0]?.encrypted_private_key || null;
    if (!key) {
      logger.warn({ walletId }, 'No encrypted private key found');
    } else {
      logger.debug({ walletId }, 'Encrypted private key retrieved successfully');
    }
    return key;
  } catch (error) {
    logger.error({ error, walletId }, 'Error fetching encrypted private key');
    throw new Error('Could not fetch encrypted private key');
  }
};
 