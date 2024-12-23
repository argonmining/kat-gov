import pool from '../config/db.js';
import { createModuleLogger } from '../utils/logger.js';
import {
  Proposal,
  ProposalVote,
  ProposalYesVote,
  ProposalNoVote,
  ProposalNomination,
  ProposalSnapshot,
  ProposalType,
  ProposalStatus,
  ProposalWallet
} from '../types/proposalTypes.js';

const logger = createModuleLogger('proposalModels');

// Proposals
export const createProposal = async (proposal: Omit<Proposal, 'id'>): Promise<Proposal> => {
  try {
    const { title, description, reviewed, approved, passed, votesActive, status, wallet, submitted } = proposal;
    logger.info({ title, status, wallet }, 'Creating proposal');
    const query = `
      INSERT INTO proposals (title, description, reviewed, approved, passed, votesActive, status, wallet, submitted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [title, description, reviewed, approved, passed, votesActive, status, wallet, submitted];
    const result = await pool.query(query, values);
    logger.debug({ id: result.rows[0].id }, 'Proposal created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, proposal }, 'Error creating proposal');
    throw new Error('Could not create proposal');
  }
};

export const getAllProposals = async (
  filters: { title?: string; status?: number },
  sort?: string,
  limit: number = 100,
  offset: number = 0
): Promise<Proposal[]> => {
  try {
    logger.info({ filters, sort, limit, offset }, 'Fetching proposals');
    let query = 'SELECT * FROM proposals WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.title) {
      query += ` AND title ILIKE $${paramCount}`;
      values.push(`%${filters.title}%`);
      paramCount++;
    }

    if (filters.status !== undefined) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (sort) {
      query += ` ORDER BY ${sort}`;
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    logger.debug({ count: result.rows.length }, 'Retrieved proposals');
    return result.rows;
  } catch (error) {
    logger.error({ error, filters, sort, limit, offset }, 'Error fetching proposals');
    throw new Error('Could not fetch proposals');
  }
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  try {
    logger.info({ id, ...proposal }, 'Updating proposal');
    const fields = Object.keys(proposal);
    const values = Object.values(proposal);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `
      UPDATE proposals
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;
    const result = await pool.query(query, [...values, id]);
    if (result.rows[0]) {
      logger.debug({ id }, 'Proposal updated successfully');
      return result.rows[0];
    }
    logger.warn({ id }, 'No proposal found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, proposal }, 'Error updating proposal');
    throw new Error('Could not update proposal');
  }
};

export const deleteProposal = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal');
    await pool.query('DELETE FROM proposals WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal');
    throw new Error('Could not delete proposal');
  }
};

export const getProposalById = async (id: number): Promise<Proposal | null> => {
  try {
    logger.info({ id }, 'Fetching proposal by ID');
    const result = await pool.query('SELECT * FROM proposals WHERE id = $1', [id]);
    if (result.rows[0]) {
      logger.debug({ id }, 'Proposal retrieved successfully');
      return result.rows[0];
    }
    logger.warn({ id }, 'No proposal found');
    return null;
  } catch (error) {
    logger.error({ error, id }, 'Error fetching proposal by ID');
    throw new Error('Could not fetch proposal');
  }
};

// Proposal Votes
export const createProposalVote = async (vote: Omit<ProposalVote, 'id'>): Promise<ProposalVote> => {
  try {
    const { proposalId, walletAddress, voteAmount, created } = vote;
    logger.info({ proposalId, walletAddress, voteAmount }, 'Creating proposal vote');
    const result = await pool.query(
      'INSERT INTO proposal_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [proposalId, walletAddress, voteAmount, created]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal vote created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal vote');
    throw new Error('Could not create proposal vote');
  }
};

export const getVotesForProposal = async (proposalId: number): Promise<ProposalVote[]> => {
  try {
    logger.info({ proposalId }, 'Fetching votes for proposal');
    const result = await pool.query('SELECT * FROM proposal_votes WHERE proposal_id = $1', [proposalId]);
    logger.debug({ count: result.rows.length }, 'Retrieved proposal votes');
    return result.rows;
  } catch (error) {
    logger.error({ error, proposalId }, 'Error fetching votes for proposal');
    throw new Error('Could not fetch votes for proposal');
  }
};

// Proposal Yes Votes
export const getAllProposalYesVotes = async (): Promise<ProposalYesVote[]> => {
  try {
    logger.info('Fetching all proposal yes votes');
    const result = await pool.query('SELECT * FROM proposal_yes_votes');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal yes votes');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal yes votes');
    throw new Error('Could not fetch proposal yes votes');
  }
};

export const createProposalYesVote = async (vote: Omit<ProposalYesVote, 'id' | 'created'>): Promise<ProposalYesVote> => {
  try {
    const { proposalId, walletAddress, voteAmount } = vote;
    logger.info({ proposalId, walletAddress, voteAmount }, 'Creating proposal yes vote');
    const result = await pool.query(
      'INSERT INTO proposal_yes_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [proposalId, walletAddress, voteAmount]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal yes vote created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal yes vote');
    throw new Error('Could not create proposal yes vote');
  }
};

export const updateProposalYesVote = async (id: number, vote: Partial<ProposalYesVote>): Promise<ProposalYesVote> => {
  try {
    const { voteAmount } = vote;
    logger.info({ id, voteAmount }, 'Updating proposal yes vote');
    const result = await pool.query(
      'UPDATE proposal_yes_votes SET vote_amount = COALESCE($1, vote_amount) WHERE id = $2 RETURNING *',
      [voteAmount, id]
    );
    logger.debug({ id }, 'Proposal yes vote updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, vote }, 'Error updating proposal yes vote');
    throw new Error('Could not update proposal yes vote');
  }
};

export const deleteProposalYesVote = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal yes vote');
    await pool.query('DELETE FROM proposal_yes_votes WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal yes vote deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal yes vote');
    throw new Error('Could not delete proposal yes vote');
  }
};

// Proposal No Votes
export const getAllProposalNoVotes = async (): Promise<ProposalNoVote[]> => {
  try {
    logger.info('Fetching all proposal no votes');
    const result = await pool.query('SELECT * FROM proposal_no_votes');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal no votes');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal no votes');
    throw new Error('Could not fetch proposal no votes');
  }
};

export const createProposalNoVote = async (vote: Omit<ProposalNoVote, 'id' | 'created'>): Promise<ProposalNoVote> => {
  try {
    const { proposalId, walletAddress, voteAmount } = vote;
    logger.info({ proposalId, walletAddress, voteAmount }, 'Creating proposal no vote');
    const result = await pool.query(
      'INSERT INTO proposal_no_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [proposalId, walletAddress, voteAmount]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal no vote created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal no vote');
    throw new Error('Could not create proposal no vote');
  }
};

export const updateProposalNoVote = async (id: number, vote: Partial<ProposalNoVote>): Promise<ProposalNoVote> => {
  try {
    const { voteAmount } = vote;
    logger.info({ id, voteAmount }, 'Updating proposal no vote');
    const result = await pool.query(
      'UPDATE proposal_no_votes SET vote_amount = COALESCE($1, vote_amount) WHERE id = $2 RETURNING *',
      [voteAmount, id]
    );
    logger.debug({ id }, 'Proposal no vote updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, vote }, 'Error updating proposal no vote');
    throw new Error('Could not update proposal no vote');
  }
};

export const deleteProposalNoVote = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal no vote');
    await pool.query('DELETE FROM proposal_no_votes WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal no vote deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal no vote');
    throw new Error('Could not delete proposal no vote');
  }
};

// Proposal Nominations
export const getAllProposalNominations = async (): Promise<ProposalNomination[]> => {
  try {
    logger.info('Fetching all proposal nominations');
    const result = await pool.query('SELECT * FROM proposal_nominations');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal nominations');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal nominations');
    throw new Error('Could not fetch proposal nominations');
  }
};

export const createProposalNomination = async (nomination: Omit<ProposalNomination, 'id'>): Promise<ProposalNomination> => {
  try {
    const { proposalId, walletAddress, nominationAmount, created } = nomination;
    logger.info({ proposalId, walletAddress, nominationAmount }, 'Creating proposal nomination');
    const result = await pool.query(
      'INSERT INTO proposal_nominations (proposal_id, wallet_address, nomination_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [proposalId, walletAddress, nominationAmount, created]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal nomination created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, nomination }, 'Error creating proposal nomination');
    throw new Error('Could not create proposal nomination');
  }
};

export const updateProposalNomination = async (id: number, nomination: Partial<ProposalNomination>): Promise<ProposalNomination> => {
  try {
    const { nominationAmount } = nomination;
    logger.info({ id, nominationAmount }, 'Updating proposal nomination');
    const result = await pool.query(
      'UPDATE proposal_nominations SET nomination_amount = COALESCE($1, nomination_amount) WHERE id = $2 RETURNING *',
      [nominationAmount, id]
    );
    logger.debug({ id }, 'Proposal nomination updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, nomination }, 'Error updating proposal nomination');
    throw new Error('Could not update proposal nomination');
  }
};

export const deleteProposalNomination = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal nomination');
    await pool.query('DELETE FROM proposal_nominations WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal nomination deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal nomination');
    throw new Error('Could not delete proposal nomination');
  }
};

// Proposal Types
export const getAllProposalTypes = async (): Promise<ProposalType[]> => {
  try {
    logger.info('Fetching all proposal types');
    const result = await pool.query('SELECT * FROM proposal_types');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal types');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal types');
    throw new Error('Could not fetch proposal types');
  }
};

export const createProposalType = async (name: string, active: boolean): Promise<ProposalType> => {
  try {
    logger.info({ name, active }, 'Creating proposal type');
    const result = await pool.query(
      'INSERT INTO proposal_types (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal type created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating proposal type');
    throw new Error('Could not create proposal type');
  }
};

export const updateProposalType = async (id: number, name: string, active: boolean): Promise<ProposalType> => {
  try {
    logger.info({ id, name, active }, 'Updating proposal type');
    const result = await pool.query(
      'UPDATE proposal_types SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    logger.debug({ id }, 'Proposal type updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating proposal type');
    throw new Error('Could not update proposal type');
  }
};

export const deleteProposalType = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal type');
    await pool.query('DELETE FROM proposal_types WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal type deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal type');
    throw new Error('Could not delete proposal type');
  }
};

// Proposal Statuses
export const getAllProposalStatuses = async (): Promise<ProposalStatus[]> => {
  try {
    logger.info('Fetching all proposal statuses');
    const result = await pool.query('SELECT * FROM proposal_statuses');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal statuses');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal statuses');
    throw new Error('Could not fetch proposal statuses');
  }
};

export const createProposalStatus = async (name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    logger.info({ name, active }, 'Creating proposal status');
    const result = await pool.query(
      'INSERT INTO proposal_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal status created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating proposal status');
    throw new Error('Could not create proposal status');
  }
};

export const updateProposalStatus = async (id: number, name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    logger.info({ id, name, active }, 'Updating proposal status');
    const result = await pool.query(
      'UPDATE proposal_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    logger.debug({ id }, 'Proposal status updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating proposal status');
    throw new Error('Could not update proposal status');
  }
};

export const deleteProposalStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal status');
    await pool.query('DELETE FROM proposal_statuses WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal status deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal status');
    throw new Error('Could not delete proposal status');
  }
};

// Proposal Wallet
export const createProposalWallet = async (address: string, encryptedPrivateKey: string): Promise<ProposalWallet> => {
  try {
    logger.info({ address, encryptedPrivateKey }, 'Creating proposal wallet');
    const result = await pool.query(
      'INSERT INTO proposal_wallets (address, encrypted_private_key) VALUES ($1, $2) RETURNING *',
      [address, encryptedPrivateKey]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal wallet created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, address, encryptedPrivateKey }, 'Error creating proposal wallet');
    throw new Error('Could not create proposal wallet');
  }
};

// Proposal Snapshots
export const getAllProposalSnapshots = async (): Promise<ProposalSnapshot[]> => {
  try {
    logger.info('Fetching all proposal snapshots');
    const result = await pool.query('SELECT * FROM proposal_snapshots');
    logger.debug({ count: result.rows.length }, 'Retrieved all proposal snapshots');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal snapshots');
    throw new Error('Could not fetch proposal snapshots');
  }
};

export const createProposalSnapshot = async (proposalId: number, snapshotData: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    logger.info({ proposalId, snapshotData }, 'Creating proposal snapshot');
    const result = await pool.query(
      'INSERT INTO proposal_snapshots (proposal_id, data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [proposalId, snapshotData]
    );
    logger.debug({ id: result.rows[0].id }, 'Proposal snapshot created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, proposalId, snapshotData }, 'Error creating proposal snapshot');
    throw new Error('Could not create proposal snapshot');
  }
};

export const updateProposalSnapshot = async (id: number, snapshotData: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    logger.info({ id, snapshotData }, 'Updating proposal snapshot');
    const result = await pool.query(
      'UPDATE proposal_snapshots SET data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    logger.debug({ id }, 'Proposal snapshot updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, snapshotData }, 'Error updating proposal snapshot');
    throw new Error('Could not update proposal snapshot');
  }
};

export const deleteProposalSnapshot = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal snapshot');
    await pool.query('DELETE FROM proposal_snapshots WHERE id = $1', [id]);
    logger.debug({ id }, 'Proposal snapshot deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal snapshot');
    throw new Error('Could not delete proposal snapshot');
  }
};

// Delete old draft proposals
export const deleteOldDraftProposals = async (): Promise<number> => {
  try {
    logger.info('Deleting old draft proposals');
    const query = `
      DELETE FROM proposals
      WHERE reviewed = false
      AND submitted < NOW() - INTERVAL '7 days'
      RETURNING id;
    `;
    const result = await pool.query(query);
    logger.debug({ count: result.rowCount }, 'Deleted old draft proposals');
    return result.rowCount || 0;
  } catch (error) {
    logger.error({ error }, 'Error deleting old draft proposals');
    throw new Error('Could not delete old draft proposals');
  }
}; 