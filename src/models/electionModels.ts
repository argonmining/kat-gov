import pool from '../config/db.js';
import {
  Election,
  ElectionCandidate,
  ElectionPosition,
  ElectionStatus,
  ElectionType,
  ElectionPrimary,
  ElectionSnapshot
} from '../types/electionTypes.js';

// Elections
export const createElection = async (election: Omit<Election, 'id'>): Promise<Election> => {
  try {
    const { title, description, reviewed, approved, votesActive, openVote, closeVote, created } = election;
    const query = `
      INSERT INTO elections (title, description, reviewed, approved, votesActive, openVote, closeVote, created)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [title, description, reviewed, approved, votesActive, openVote, closeVote, created];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election:', error);
    throw new Error('Could not create election');
  }
};

export const getAllElections = async (): Promise<Election[]> => {
  try {
    const query = 'SELECT * FROM elections';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw new Error('Could not fetch elections');
  }
};

export const deleteElection = async (id: number): Promise<void> => {
  try {
    const query = 'DELETE FROM elections WHERE id = $1';
    await pool.query(query, [id]);
  } catch (error) {
    console.error('Error deleting election:', error);
    throw new Error('Could not delete election');
  }
};

// Election Candidates
export const getAllElectionCandidates = async (): Promise<ElectionCandidate[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_candidates');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election candidates:', error);
    throw new Error('Could not fetch election candidates');
  }
};

export const createElectionCandidate = async (candidate: Omit<ElectionCandidate, 'id'>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, created, data } = candidate;
    const result = await pool.query(
      'INSERT INTO election_candidates (name, twitter, discord, telegram, created, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, twitter, discord, telegram, created, data]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election candidate:', error);
    throw new Error('Could not create election candidate');
  }
};

export const updateElectionCandidate = async (id: number, candidate: Partial<ElectionCandidate>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, data } = candidate;
    const result = await pool.query(
      'UPDATE election_candidates SET name = COALESCE($1, name), twitter = COALESCE($2, twitter), discord = COALESCE($3, discord), telegram = COALESCE($4, telegram), data = COALESCE($5, data) WHERE id = $6 RETURNING *',
      [name, twitter, discord, telegram, data, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election candidate:', error);
    throw new Error('Could not update election candidate');
  }
};

export const deleteElectionCandidate = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_candidates WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election candidate:', error);
    throw new Error('Could not delete election candidate');
  }
};

// Election Positions
export const getAllElectionPositions = async (): Promise<ElectionPosition[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_positions');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election positions:', error);
    throw new Error('Could not fetch election positions');
  }
};

export const createElectionPosition = async (title: string, description: string): Promise<ElectionPosition> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_positions (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election position:', error);
    throw new Error('Could not create election position');
  }
};

export const updateElectionPosition = async (id: number, title: string, description: string): Promise<ElectionPosition> => {
  try {
    const result = await pool.query(
      'UPDATE election_positions SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election position:', error);
    throw new Error('Could not update election position');
  }
};

export const deleteElectionPosition = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_positions WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election position:', error);
    throw new Error('Could not delete election position');
  }
};

// Election Statuses
export const getAllElectionStatuses = async (): Promise<ElectionStatus[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_statuses');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election statuses:', error);
    throw new Error('Could not fetch election statuses');
  }
};

export const createElectionStatus = async (name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_statuses (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election status:', error);
    throw new Error('Could not create election status');
  }
};

export const updateElectionStatus = async (id: number, name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    const result = await pool.query(
      'UPDATE election_statuses SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election status:', error);
    throw new Error('Could not update election status');
  }
};

export const deleteElectionStatus = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_statuses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election status:', error);
    throw new Error('Could not delete election status');
  }
};

// Election Types
export const getAllElectionTypes = async (): Promise<ElectionType[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_types');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election types:', error);
    throw new Error('Could not fetch election types');
  }
};

export const createElectionType = async (name: string, active: boolean): Promise<ElectionType> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_types (name, active) VALUES ($1, $2) RETURNING *',
      [name, active]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election type:', error);
    throw new Error('Could not create election type');
  }
};

export const updateElectionType = async (id: number, name: string, active: boolean): Promise<ElectionType> => {
  try {
    const result = await pool.query(
      'UPDATE election_types SET name = $1, active = $2 WHERE id = $3 RETURNING *',
      [name, active, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election type:', error);
    throw new Error('Could not update election type');
  }
};

export const deleteElectionType = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_types WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election type:', error);
    throw new Error('Could not delete election type');
  }
};

// Election Snapshots
export const getAllElectionSnapshots = async (): Promise<ElectionSnapshot[]> => {
  try {
    const result = await pool.query('SELECT * FROM election_snapshots');
    return result.rows;
  } catch (error) {
    console.error('Error fetching election snapshots:', error);
    throw new Error('Could not fetch election snapshots');
  }
};

export const createElectionSnapshot = async (electionId: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot> => {
  try {
    const result = await pool.query(
      'INSERT INTO election_snapshots (election_id, data, created) VALUES ($1, $2, NOW()) RETURNING *',
      [electionId, snapshotData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating election snapshot:', error);
    throw new Error('Could not create election snapshot');
  }
};

export const updateElectionSnapshot = async (id: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot> => {
  try {
    const result = await pool.query(
      'UPDATE election_snapshots SET data = $1 WHERE id = $2 RETURNING *',
      [snapshotData, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating election snapshot:', error);
    throw new Error('Could not update election snapshot');
  }
};

export const deleteElectionSnapshot = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM election_snapshots WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting election snapshot:', error);
    throw new Error('Could not delete election snapshot');
  }
}; 