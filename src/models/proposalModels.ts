import pool from '../config/db.js';
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

// Proposals
export const createProposal = async (proposal: Omit<Proposal, 'id'>): Promise<Proposal> => {
  try {
    const { title, description, reviewed, approved, passed, votesActive, status, wallet, submitted } = proposal;
    const query = `
      INSERT INTO proposals (title, description, reviewed, approved, passed, votesActive, status, wallet, submitted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [title, description, reviewed, approved, passed, votesActive, status, wallet, submitted];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal:', error);
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
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw new Error('Could not fetch proposals');
  }
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  try {
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
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating proposal:', error);
    throw new Error('Could not update proposal');
  }
};

export const deleteProposal = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposals WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw new Error('Could not delete proposal');
  }
};

export const getProposalById = async (id: number): Promise<Proposal | null> => {
  try {
    const result = await pool.query('SELECT * FROM proposals WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching proposal by ID:', error);
    throw new Error('Could not fetch proposal');
  }
};

// Proposal Votes
export const createProposalVote = async (vote: Omit<ProposalVote, 'id'>): Promise<ProposalVote> => {
  try {
    const { proposalId, walletAddress, voteAmount, created } = vote;
    const result = await pool.query(
      'INSERT INTO proposal_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [proposalId, walletAddress, voteAmount, created]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal vote:', error);
    throw new Error('Could not create proposal vote');
  }
};

export const getVotesForProposal = async (proposalId: number): Promise<ProposalVote[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_votes WHERE proposal_id = $1', [proposalId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching votes for proposal:', error);
    throw new Error('Could not fetch votes for proposal');
  }
};

// Proposal Yes Votes
export const getAllProposalYesVotes = async (): Promise<ProposalYesVote[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_yes_votes');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal yes votes:', error);
    throw new Error('Could not fetch proposal yes votes');
  }
};

export const createProposalYesVote = async (vote: Omit<ProposalYesVote, 'id' | 'created'>): Promise<ProposalYesVote> => {
  try {
    const { proposalId, walletAddress, voteAmount } = vote;
    const result = await pool.query(
      'INSERT INTO proposal_yes_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [proposalId, walletAddress, voteAmount]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal yes vote:', error);
    throw new Error('Could not create proposal yes vote');
  }
};

export const updateProposalYesVote = async (id: number, vote: Partial<ProposalYesVote>): Promise<ProposalYesVote> => {
  try {
    const { voteAmount } = vote;
    const result = await pool.query(
      'UPDATE proposal_yes_votes SET vote_amount = COALESCE($1, vote_amount) WHERE id = $2 RETURNING *',
      [voteAmount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal yes vote:', error);
    throw new Error('Could not update proposal yes vote');
  }
};

export const deleteProposalYesVote = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_yes_votes WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal yes vote:', error);
    throw new Error('Could not delete proposal yes vote');
  }
};

// Proposal No Votes
export const getAllProposalNoVotes = async (): Promise<ProposalNoVote[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_no_votes');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal no votes:', error);
    throw new Error('Could not fetch proposal no votes');
  }
};

export const createProposalNoVote = async (vote: Omit<ProposalNoVote, 'id' | 'created'>): Promise<ProposalNoVote> => {
  try {
    const { proposalId, walletAddress, voteAmount } = vote;
    const result = await pool.query(
      'INSERT INTO proposal_no_votes (proposal_id, wallet_address, vote_amount, created) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [proposalId, walletAddress, voteAmount]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal no vote:', error);
    throw new Error('Could not create proposal no vote');
  }
};

export const updateProposalNoVote = async (id: number, vote: Partial<ProposalNoVote>): Promise<ProposalNoVote> => {
  try {
    const { voteAmount } = vote;
    const result = await pool.query(
      'UPDATE proposal_no_votes SET vote_amount = COALESCE($1, vote_amount) WHERE id = $2 RETURNING *',
      [voteAmount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal no vote:', error);
    throw new Error('Could not update proposal no vote');
  }
};

export const deleteProposalNoVote = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_no_votes WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal no vote:', error);
    throw new Error('Could not delete proposal no vote');
  }
};

// Proposal Nominations
export const getAllProposalNominations = async (): Promise<ProposalNomination[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_nominations');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal nominations:', error);
    throw new Error('Could not fetch proposal nominations');
  }
};

export const createProposalNomination = async (nomination: Omit<ProposalNomination, 'id'>): Promise<ProposalNomination> => {
  try {
    const { proposalId, walletAddress, nominationAmount, created } = nomination;
    const result = await pool.query(
      'INSERT INTO proposal_nominations (proposal_id, wallet_address, nomination_amount, created) VALUES ($1, $2, $3, $4) RETURNING *',
      [proposalId, walletAddress, nominationAmount, created]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal nomination:', error);
    throw new Error('Could not create proposal nomination');
  }
};

export const updateProposalNomination = async (id: number, nomination: Partial<ProposalNomination>): Promise<ProposalNomination> => {
  try {
    const { nominationAmount } = nomination;
    const result = await pool.query(
      'UPDATE proposal_nominations SET nomination_amount = COALESCE($1, nomination_amount) WHERE id = $2 RETURNING *',
      [nominationAmount, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal nomination:', error);
    throw new Error('Could not update proposal nomination');
  }
};

export const deleteProposalNomination = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_nominations WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal nomination:', error);
    throw new Error('Could not delete proposal nomination');
  }
};

// Proposal Types
export const getAllProposalTypes = async (): Promise<ProposalType[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_types');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal types:', error);
    throw new Error('Could not fetch proposal types');
  }
};

export const createProposalType = async (name: string, active: boolean): Promise<ProposalType> => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_types (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal type:', error);
    throw new Error('Could not create proposal type');
  }
};

export const updateProposalType = async (id: number, name: string, active: boolean): Promise<ProposalType> => {
  try {
    const result = await pool.query(
      'UPDATE proposal_types SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal type:', error);
    throw new Error('Could not update proposal type');
  }
};

export const deleteProposalType = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_types WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal type:', error);
    throw new Error('Could not delete proposal type');
  }
};

// Proposal Statuses
export const getAllProposalStatuses = async (): Promise<ProposalStatus[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_statuses');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal statuses:', error);
    throw new Error('Could not fetch proposal statuses');
  }
};

export const createProposalStatus = async (name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal status:', error);
    throw new Error('Could not create proposal status');
  }
};

export const updateProposalStatus = async (id: number, name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    const result = await pool.query(
      'UPDATE proposal_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal status:', error);
    throw new Error('Could not update proposal status');
  }
};

export const deleteProposalStatus = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_statuses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal status:', error);
    throw new Error('Could not delete proposal status');
  }
};

// Proposal Wallet
export const createProposalWallet = async (address: string, encryptedPrivateKey: string): Promise<ProposalWallet> => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_wallets (address, encrypted_private_key) VALUES ($1, $2) RETURNING *',
      [address, encryptedPrivateKey]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal wallet:', error);
    throw new Error('Could not create proposal wallet');
  }
};

// Proposal Snapshots
export const getAllProposalSnapshots = async (): Promise<ProposalSnapshot[]> => {
  try {
    const result = await pool.query('SELECT * FROM proposal_snapshots');
    return result.rows;
  } catch (error) {
    console.error('Error fetching proposal snapshots:', error);
    throw new Error('Could not fetch proposal snapshots');
  }
};

export const createProposalSnapshot = async (proposalId: number, snapshotData: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    const result = await pool.query(
      'INSERT INTO proposal_snapshots (proposal_id, data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [proposalId, snapshotData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating proposal snapshot:', error);
    throw new Error('Could not create proposal snapshot');
  }
};

export const updateProposalSnapshot = async (id: number, snapshotData: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    const result = await pool.query(
      'UPDATE proposal_snapshots SET data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating proposal snapshot:', error);
    throw new Error('Could not update proposal snapshot');
  }
};

export const deleteProposalSnapshot = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM proposal_snapshots WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting proposal snapshot:', error);
    throw new Error('Could not delete proposal snapshot');
  }
}; 