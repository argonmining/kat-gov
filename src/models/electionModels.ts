import { prisma } from '../config/prisma.js';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import {
  Election,
  ElectionCandidate,
  ElectionPosition,
  ElectionStatus,
  ElectionType,
  ElectionSnapshot,
  CandidateVote
} from '../types/electionTypes.js';

const logger = createModuleLogger('electionModels');

// Elections
export const createElection = async (election: {
  title: string;
  description: string;
  reviewed: boolean;
  approved: boolean;
  votesactive: boolean;
  openvote: Date | null;
  closevote: Date | null;
  created: Date;
  type: number;
  position: number;
  firstcandidate?: number | null;
  secondcandidate?: number | null;
  status: number;
  snapshot?: number | null;
}): Promise<Election> => {
  try {
    logger.info({ election }, 'Creating election');
    const result = await prisma.elections.create({
      data: election,
      include: {
        election_types: true,
        election_positions: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        election_statuses: true,
        election_snapshots: true
      }
    });
    logger.debug({ id: result.id }, 'Election created successfully');
    return result as unknown as Election;
  } catch (error) {
    logger.error({ error, election }, 'Error creating election');
    throw new Error('Could not create election');
  }
};

export const getAllElections = async (): Promise<Election[]> => {
  try {
    logger.info('Fetching all elections');
    const result = await prisma.elections.findMany({
      include: {
        election_types: true,
        election_positions: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        election_statuses: true,
        election_snapshots: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all elections');
    return result as unknown as Election[];
  } catch (error) {
    logger.error({ error }, 'Error fetching elections');
    throw new Error('Could not fetch elections');
  }
};

export const updateElection = async (id: number, election: Partial<Election>): Promise<Election | null> => {
  try {
    logger.info({ id, ...election }, 'Updating election');
    const result = await prisma.elections.update({
      where: { id },
      data: election,
      include: {
        election_types: true,
        election_positions: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        election_statuses: true,
        election_snapshots: true
      }
    });

    if (result) {
      logger.debug({ id }, 'Election updated successfully');
      return result as unknown as Election;
    }
    
    logger.warn({ id }, 'No election found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, election }, 'Error updating election');
    throw new Error('Could not update election');
  }
};

export const deleteElection = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election');
    await prisma.elections.delete({
      where: { id }
    });
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
    const result = await prisma.election_candidates.findMany({
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        election_primaries: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all election candidates');
    return result as unknown as ElectionCandidate[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election candidates');
    throw new Error('Could not fetch election candidates');
  }
};

export const createElectionCandidate = async (candidate: Omit<ElectionCandidate, 'id'>): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, created, data, type, status, wallet, nominations } = candidate;
    logger.info({ name, twitter, discord, telegram }, 'Creating election candidate');
    const result = await prisma.election_candidates.create({
      data: {
        name,
        twitter,
        discord,
        telegram,
        created,
        data,
        type,
        status,
        wallet,
        nominations
      },
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        election_primaries: true
      }
    });
    logger.debug({ id: result.id }, 'Election candidate created successfully');
    return result as unknown as ElectionCandidate;
  } catch (error) {
    logger.error({ error, candidate }, 'Error creating election candidate');
    throw new Error('Could not create election candidate');
  }
};

export const updateElectionCandidate = async (id: number, candidate: Partial<ElectionCandidate>): Promise<ElectionCandidate | null> => {
  try {
    logger.info({ id, ...candidate }, 'Updating election candidate');
    const result = await prisma.election_candidates.update({
      where: { id },
      data: candidate,
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        election_primaries: true
      }
    });

    if (result) {
      logger.debug({ id }, 'Election candidate updated successfully');
      return result as unknown as ElectionCandidate;
    }
    
    logger.warn({ id }, 'No election candidate found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, candidate }, 'Error updating election candidate');
    throw new Error('Could not update election candidate');
  }
};

export const deleteElectionCandidate = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election candidate');
    await prisma.election_candidates.delete({
      where: { id }
    });
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
    const result = await prisma.election_positions.findMany();
    logger.debug({ count: result.length }, 'Retrieved all election positions');
    return result as unknown as ElectionPosition[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election positions');
    throw new Error('Could not fetch election positions');
  }
};

export const createElectionPosition = async (title: string, description: string): Promise<ElectionPosition> => {
  try {
    logger.info({ title }, 'Creating election position');
    const result = await prisma.election_positions.create({
      data: {
        title,
        description
      }
    });
    logger.debug({ id: result.id }, 'Election position created successfully');
    return result as unknown as ElectionPosition;
  } catch (error) {
    logger.error({ error, title, description }, 'Error creating election position');
    throw new Error('Could not create election position');
  }
};

export const updateElectionPosition = async (id: number, title: string, description: string): Promise<ElectionPosition | null> => {
  try {
    logger.info({ id, title }, 'Updating election position');
    const result = await prisma.election_positions.update({
      where: { id },
      data: {
        title,
        description
      }
    });

    if (result) {
      logger.debug({ id }, 'Election position updated successfully');
      return result as unknown as ElectionPosition;
    }
    
    logger.warn({ id }, 'No election position found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, title, description }, 'Error updating election position');
    throw new Error('Could not update election position');
  }
};

export const deleteElectionPosition = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election position');
    await prisma.election_positions.delete({
      where: { id }
    });
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
    const result = await prisma.election_statuses.findMany();
    logger.debug({ count: result.length }, 'Retrieved all election statuses');
    return result as unknown as ElectionStatus[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election statuses');
    throw new Error('Could not fetch election statuses');
  }
};

export const createElectionStatus = async (name: string, active: boolean): Promise<ElectionStatus> => {
  try {
    logger.info({ name, active }, 'Creating election status');
    const result = await prisma.election_statuses.create({
      data: {
        name,
        active
      }
    });
    logger.debug({ id: result.id }, 'Election status created successfully');
    return result as unknown as ElectionStatus;
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating election status');
    throw new Error('Could not create election status');
  }
};

export const updateElectionStatus = async (id: number, name: string, active: boolean): Promise<ElectionStatus | null> => {
  try {
    logger.info({ id, name, active }, 'Updating election status');
    const result = await prisma.election_statuses.update({
      where: { id },
      data: {
        name,
        active
      }
    });

    if (result) {
      logger.debug({ id }, 'Election status updated successfully');
      return result as unknown as ElectionStatus;
    }
    
    logger.warn({ id }, 'No election status found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating election status');
    throw new Error('Could not update election status');
  }
};

export const deleteElectionStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election status');
    await prisma.election_statuses.delete({
      where: { id }
    });
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
    const result = await prisma.election_types.findMany();
    logger.debug({ count: result.length }, 'Retrieved all election types');
    return result as unknown as ElectionType[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election types');
    throw new Error('Could not fetch election types');
  }
};

export const createElectionType = async (name: string, active: boolean): Promise<ElectionType> => {
  try {
    logger.info({ name, active }, 'Creating election type');
    const result = await prisma.election_types.create({
      data: {
        name,
        active
      }
    });
    logger.debug({ id: result.id }, 'Election type created successfully');
    return result as unknown as ElectionType;
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating election type');
    throw new Error('Could not create election type');
  }
};

export const updateElectionType = async (id: number, name: string, active: boolean): Promise<ElectionType | null> => {
  try {
    logger.info({ id, name, active }, 'Updating election type');
    const result = await prisma.election_types.update({
      where: { id },
      data: {
        name,
        active
      }
    });

    if (result) {
      logger.debug({ id }, 'Election type updated successfully');
      return result as unknown as ElectionType;
    }
    
    logger.warn({ id }, 'No election type found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating election type');
    throw new Error('Could not update election type');
  }
};

export const deleteElectionType = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election type');
    await prisma.election_types.delete({
      where: { id }
    });
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
    const result = await prisma.election_snapshots.findMany({
      include: {
        elections: true,
        election_primaries: true,
        candidate_votes: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all election snapshots');
    return result as unknown as ElectionSnapshot[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election snapshots');
    throw new Error('Could not fetch election snapshots');
  }
};

export const createElectionSnapshot = async (electionId: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot> => {
  try {
    logger.info({ electionId }, 'Creating election snapshot');
    const result = await prisma.election_snapshots.create({
      data: {
        generated: new Date(),
        data: snapshotData,
        elections: {
          connect: { id: electionId }
        }
      },
      include: {
        elections: true,
        election_primaries: true,
        candidate_votes: true
      }
    });
    logger.debug({ id: result.id }, 'Election snapshot created successfully');
    return result as unknown as ElectionSnapshot;
  } catch (error) {
    logger.error({ error, electionId, snapshotData }, 'Error creating election snapshot');
    throw new Error('Could not create election snapshot');
  }
};

export const updateElectionSnapshot = async (id: number, snapshotData: Record<string, any>): Promise<ElectionSnapshot | null> => {
  try {
    logger.info({ id, snapshotData }, 'Updating election snapshot');
    const result = await prisma.election_snapshots.update({
      where: { id },
      data: {
        data: snapshotData
      },
      include: {
        elections: true,
        election_primaries: true,
        candidate_votes: true
      }
    });

    if (result) {
      logger.debug({ id }, 'Election snapshot updated successfully');
      return result as unknown as ElectionSnapshot;
    }
    
    logger.warn({ id }, 'No election snapshot found to update');
    return null;
  } catch (error) {
    logger.error({ error, id, snapshotData }, 'Error updating election snapshot');
    throw new Error('Could not update election snapshot');
  }
};

export const deleteElectionSnapshot = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting election snapshot');
    await prisma.election_snapshots.delete({
      where: { id }
    });
    logger.debug({ id }, 'Election snapshot deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting election snapshot');
    throw new Error('Could not delete election snapshot');
  }
};
  