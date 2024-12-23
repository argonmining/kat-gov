import pool from '../config/db.js';
import { createModuleLogger } from '../utils/logger.js';
import {
  Election,
  ElectionCandidate,
  ElectionPosition,
  ElectionStatus,
  ElectionType,
  ElectionPrimary,
  ElectionSnapshot
} from '../types/electionTypes.js';

const logger = createModuleLogger('electionModels');

// Elections
export const createElection = async (election: Omit<Election, 'id'>): Promise<Election> => {
  try {
    const { title, description, reviewed, approved, votesActive, openVote, closeVote, created } = election;
    logger.info({ title, reviewed, approved, votesActive }, 'Creating election');
    const query = `
      INSERT INTO elections (title, description, reviewed, approved, votesActive, openVote, closeVote, created)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [title, description, reviewed, approved, votesActive, openVote, closeVote, created];
    const result = await pool.query(query, values);
    logger.debug({ id: result.rows[0].id }, 'Election created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, election }, 'Error creating election');
    throw new Error('Could not create election');
  }
};

export const getAllElections = async (): Promise<Election[]> => {
  try {
    logger.info('Fetching all elections');
    const query = 'SELECT * FROM elections';
    const result = await pool.query(query);
    logger.debug({ count: result.rows.length }, 'Retrieved all elections');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching elections');
    throw new Error('Could not fetch elections');
  }
};

export const deleteElection = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election');
    const query = 'DELETE FROM elections WHERE id = $1';
    await pool.query(query, [id]);
    logger.debug({ id }, 'Election deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election');
    throw new Error('Could not delete election');
  }
};

// Election Candidates
export const getAllElectionCandidates = async (): Promise<ElectionCandidate[]> => {
  try {
    logger.info('Fetching all election candidates');
    const result = await pool.query('SELECT * FROM election_candidates');
    logger.debug({ count: result.rows.length }, 'Retrieved all election candidates');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching election candidates');
    throw new Error('Could not fetch election candidates');
  }
};

export const createElectionCandidate = async (candidate: Omit<ElectionCandidate, 'id'>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, created, data } = candidate;
    logger.info({ name, twitter, discord, telegram }, 'Creating election candidate');
    const result = await pool.query(
      'INSERT INTO election_candidates (name, twitter, discord, telegram, created, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, twitter, discord, telegram, created, data]
    );
    logger.debug({ id: result.rows[0].id }, 'Election candidate created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, candidate }, 'Error creating election candidate');
    throw new Error('Could not create election candidate');
  }
};

export const updateElectionCandidate = async (id: number, candidate: Partial<ElectionCandidate>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, data } = candidate;
    logger.info({ id, name, twitter, discord, telegram }, 'Updating election candidate');
    const result = await pool.query(
      'UPDATE election_candidates SET name = COALESCE($1, name), twitter = COALESCE($2, twitter), discord = COALESCE($3, discord), telegram = COALESCE($4, telegram), data = COALESCE($5, data) WHERE id = $6 RETURNING *',
      [name, twitter, discord, telegram, data, id]
    );
    logger.debug({ id }, 'Election candidate updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, candidate }, 'Error updating election candidate');
    throw new Error('Could not update election candidate');
  }
};

export const deleteElectionCandidate = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election candidate');
    await pool.query('DELETE FROM election_candidates WHERE id = $1', [id]);
    logger.debug({ id }, 'Election candidate deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election candidate');
    throw new Error('Could not delete election candidate');
  }
};

// Election Positions
export const getAllElectionPositions = async (): Promise<ElectionPosition[]> => {
  try {
    logger.info('Fetching all election positions');
    const result = await pool.query('SELECT * FROM election_positions');
    logger.debug({ count: result.rows.length }, 'Retrieved all election positions');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching election positions');
    throw new Error('Could not fetch election positions');
  }
};

export const createElectionPosition = async (title: string, description: string): Promise<ElectionPosition> => {
  try {
    logger.info({ title }, 'Creating election position');
    const result = await pool.query(
      'INSERT INTO election_positions (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    logger.debug({ id: result.rows[0].id }, 'Election position created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, title, description }, 'Error creating election position');
    throw new Error('Could not create election position');
  }
};

export const updateElectionPosition = async (id: number, title: string, description: string): Promise<ElectionPosition> => {
  try {
    logger.info({ id, title }, 'Updating election position');
    const result = await pool.query(
      'UPDATE election_positions SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    logger.debug({ id }, 'Election position updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, title, description }, 'Error updating election position');
    throw new Error('Could not update election position');
  }
};

export const deleteElectionPosition = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election position');
    await pool.query('DELETE FROM election_positions WHERE id = $1', [id]);
    logger.debug({ id }, 'Election position deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election position');
    throw new Error('Could not delete election position');
  }
};

// Election Statuses
export const getAllElectionStatuses = async (): Promise<ElectionStatus[]> => {
  try {
    logger.info('Fetching all election statuses');
    const result = await pool.query('SELECT * FROM election_statuses');
    logger.debug({ count: result.rows.length }, 'Retrieved all election statuses');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching election statuses');
    throw new Error('Could not fetch election statuses');
  }
};

export const createElectionStatus = async (name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    logger.info({ name, active }, 'Creating election status');
    const result = await pool.query(
      'INSERT INTO election_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    logger.debug({ id: result.rows[0].id }, 'Election status created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating election status');
    throw new Error('Could not create election status');
  }
};

export const updateElectionStatus = async (id: number, name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    logger.info({ id, name, active }, 'Updating election status');
    const result = await pool.query(
      'UPDATE election_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    logger.debug({ id }, 'Election status updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating election status');
    throw new Error('Could not update election status');
  }
};

export const deleteElectionStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election status');
    await pool.query('DELETE FROM election_statuses WHERE id = $1', [id]);
    logger.debug({ id }, 'Election status deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election status');
    throw new Error('Could not delete election status');
  }
};

// Election Types
export const getAllElectionTypes = async (): Promise<ElectionType[]> => {
  try {
    logger.info('Fetching all election types');
    const result = await pool.query('SELECT * FROM election_types');
    logger.debug({ count: result.rows.length }, 'Retrieved all election types');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching election types');
    throw new Error('Could not fetch election types');
  }
};

export const createElectionType = async (name: string, active: boolean): Promise<ElectionType> => {
  try {
    logger.info({ name, active }, 'Creating election type');
    const result = await pool.query(
      'INSERT INTO election_types (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    logger.debug({ id: result.rows[0].id }, 'Election type created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating election type');
    throw new Error('Could not create election type');
  }
};

export const updateElectionType = async (id: number, name: string, active: boolean): Promise<ElectionType> => {
  try {
    logger.info({ id, name, active }, 'Updating election type');
    const result = await pool.query(
      'UPDATE election_types SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    logger.debug({ id }, 'Election type updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating election type');
    throw new Error('Could not update election type');
  }
};

export const deleteElectionType = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election type');
    await pool.query('DELETE FROM election_types WHERE id = $1', [id]);
    logger.debug({ id }, 'Election type deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election type');
    throw new Error('Could not delete election type');
  }
};

// Election Snapshots
export const getAllElectionSnapshots = async (): Promise<ElectionSnapshot[]> => {
  try {
    logger.info('Fetching all election snapshots');
    const result = await pool.query('SELECT * FROM election_snapshots');
    logger.debug({ count: result.rows.length }, 'Retrieved all election snapshots');
    return result.rows;
  } catch (error) {
    logger.error({ error }, 'Error fetching election snapshots');
    throw new Error('Could not fetch election snapshots');
  }
};

export const createElectionSnapshot = async (electionId: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot> => {
  try {
    logger.info({ electionId }, 'Creating election snapshot');
    const result = await pool.query(
      'INSERT INTO election_snapshots (election_id, data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [electionId, snapshotData]
    );
    logger.debug({ id: result.rows[0].id }, 'Election snapshot created successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, electionId, snapshotData }, 'Error creating election snapshot');
    throw new Error('Could not create election snapshot');
  }
};

export const updateElectionSnapshot = async (id: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot> => {
  try {
    logger.info({ id, snapshotData }, 'Updating election snapshot');
    const result = await pool.query(
      'UPDATE election_snapshots SET data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    logger.debug({ id }, 'Election snapshot updated successfully');
    return result.rows[0];
  } catch (error) {
    logger.error({ error, id, snapshotData }, 'Error updating election snapshot');
    throw new Error('Could not update election snapshot');
  }
};

export const deleteElectionSnapshot = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election snapshot');
    await pool.query('DELETE FROM election_snapshots WHERE id = $1', [id]);
    logger.debug({ id }, 'Election snapshot deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election snapshot');
    throw new Error('Could not delete election snapshot');
  }
}; 