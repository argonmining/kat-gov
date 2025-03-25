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
  CandidateVote,
  ElectionVote,
  PrimaryElection
} from '../types/electionTypes.js';
import { calculateVoteWeight, validateVoteAmount } from '../utils/voteCalculator.js';

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
        election_statuses: true,
        election_snapshots: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        primary: {
          include: {
            election_types: true,
            election_positions: true,
            election_statuses: true,
            election_snapshots: true
          }
        }
      }
    });

    return result.map(election => ({
      id: election.id,
      title: election.title || '',
      description: election.description || '',
      reviewed: election.reviewed || false,
      approved: election.approved || false,
      votesactive: election.votesactive || false,
      openvote: election.openvote,
      closevote: election.closevote,
      created: election.created || new Date(),
      type: election.type || 0,
      position: election.position || 0,
      firstcandidate: election.firstcandidate,
      secondcandidate: election.secondcandidate,
      status: election.status || 0,
      snapshot: election.snapshot
    }));
  } catch (error) {
    logger.error({ error }, 'Error fetching elections');
    throw error;
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
        candidates_of_primaries: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all election candidates');
    return result as unknown as ElectionCandidate[];
  } catch (error) {
    logger.error({ error }, 'Error fetching election candidates');
    throw new Error('Could not fetch election candidates');
  }
};

export const getElectionCandidatesByElectionId = async (electionId: number): Promise<ElectionCandidate[]> => {
  try {
    logger.info({ electionId }, 'Fetching candidates for election');
    
    // Get the election to find first and second candidates
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        firstcandidate: true,
        secondcandidate: true
      }
    });

    if (!election) {
      logger.warn({ electionId }, 'Election not found');
      return [];
    }

    // Get candidates based on firstcandidate and secondcandidate IDs
    const candidateIds = [election.firstcandidate, election.secondcandidate]
      .filter((id): id is number => id !== null);

    if (candidateIds.length === 0) {
      logger.debug({ electionId }, 'No candidates found for election');
      return [];
    }

    const candidates = await prisma.election_candidates.findMany({
      where: {
        id: {
          in: candidateIds
        }
      },
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        candidates_of_primaries: true
      }
    });

    logger.debug({ 
      electionId, 
      candidateCount: candidates.length 
    }, 'Retrieved candidates for election');

    return candidates as unknown as ElectionCandidate[];
  } catch (error) {
    logger.error({ error, electionId }, 'Error fetching election candidates');
    throw new Error('Could not fetch election candidates');
  }
};

export const createElectionCandidate = async (candidate: Omit<ElectionCandidate, 'id'> & { primaryId?: number }): Promise<ElectionCandidate> => {
  try {
    const { name, twitter, discord, telegram, created, data, type, status, wallet, nominations, primaryId } = candidate;
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
        nominations,
        candidates_of_primaries: primaryId ? {
          connect: [{
            id: primaryId
          }]
        } : undefined
      },
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        candidates_of_primaries: true
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
    
    // Extract only the updatable fields from the candidate object
    const updateData = {
      name: candidate.name,
      twitter: candidate.twitter,
      discord: candidate.discord,
      telegram: candidate.telegram,
      type: candidate.type,
      status: candidate.status,
      wallet: candidate.wallet,
      nominations: candidate.nominations,
      data: candidate.data
    };

    const result = await prisma.election_candidates.update({
      where: { id },
      data: updateData,
      include: {
        elections_elections_firstcandidateToelection_candidates: true,
        elections_elections_secondcandidateToelection_candidates: true,
        candidate_nominations_candidate_nominations_candidate_idToelection_candidates: true,
        candidate_nominations_election_candidates_nominationsTocandidate_nominations: true,
        candidate_votes: true,
        candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
        candidate_wallets_election_candidates_walletTocandidate_wallets: true,
        candidates_of_primaries: true
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
    const result = await prisma.election_positions.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        created: true
      }
    });
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
    
    // Create the snapshot
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

    // Update the election to reference this snapshot
    await prisma.elections.update({
      where: { id: electionId },
      data: { snapshot: result.id }
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

// Count active elections
export const countActiveElections = async (): Promise<number> => {
  try {
    logger.info('Counting active elections');
    
    // First get the active status ID
    const activeStatus = await prisma.election_statuses.findFirst({
      where: {
        name: 'Active',
        active: true
      }
    });

    if (!activeStatus) {
      logger.warn('No active status found in election_statuses');
      return 0;
    }

    const count = await prisma.elections.count({
      where: {
        status: activeStatus.id
      }
    });

    logger.debug({ count }, 'Active elections counted successfully');
    return count;
  } catch (error) {
    logger.error({ error }, 'Error counting active elections');
    throw new Error('Could not count active elections');
  }
};

export const getElectionById = async (id: number): Promise<Election | null> => {
  try {
    logger.info({ id }, 'Getting election by ID');
    const election = await prisma.elections.findUnique({
      where: { id },
      include: {
        election_types: true,
        election_positions: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        election_statuses: true,
        election_snapshots: true
      }
    });
    
    if (!election) {
      logger.warn({ id }, 'Election not found');
      return null;
    }

    logger.debug({ id: election.id }, 'Election retrieved successfully');
    return election as unknown as Election;
  } catch (error) {
    logger.error({ error, id }, 'Error getting election by ID');
    throw error;
  }
};

export const createElectionVote = async (vote: {
  election_id: number;
  candidate_id: number;
  toaddress: string;
  amountsent: number | Decimal;
}): Promise<ElectionVote> => {
  try {
    const { election_id, candidate_id, toaddress, amountsent } = vote;
    if (!election_id || !candidate_id || !toaddress || !amountsent) {
      throw new Error('Missing required fields for vote');
    }

    logger.info({ election_id, candidate_id, toaddress, amountsent }, 'Creating election vote');

    // Get election and its snapshot
    const election = await getElectionById(election_id);
    if (!election || !election.snapshot) {
      throw new Error('Election or snapshot not found');
    }

    const snapshot = await prisma.election_snapshots.findUnique({
      where: { id: election.snapshot }
    });

    if (!snapshot || !snapshot.data) {
      throw new Error('Snapshot data not found');
    }

    // Validate amount against snapshot
    const isValid = await validateVoteAmount(toaddress, amountsent, snapshot.data);
    if (!isValid) {
      throw new Error('Invalid vote amount: insufficient balance at snapshot time');
    }

    // Calculate vote weight
    const voteWeight = calculateVoteWeight(amountsent);
    
    // Create the vote using candidate_votes table
    const result = await prisma.candidate_votes.create({
      data: {
        candidate_id: Number(candidate_id),
        toaddress,
        amountsent: new Decimal(amountsent.toString()),
        votescounted: voteWeight.votes,
        validvote: true,
        created: new Date(),
        election_snapshot_id: election.snapshot
      }
    });

    // Transform the result to match the ElectionVote interface
    const electionVote: ElectionVote = {
      id: result.id,
      election_id,
      candidate_id,
      toaddress: result.toaddress!,
      amountsent: result.amountsent!,
      created: result.created!,
      validvote: result.validvote!,
      votescounted: result.votescounted!,
      election_snapshot_id: result.election_snapshot_id ?? undefined
    };

    logger.debug({ 
      id: result.id, 
      votes: voteWeight.votes,
      powerLevel: voteWeight.powerLevel 
    }, 'Election vote created successfully');
    
    return electionVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating election vote');
    throw error;
  }
};

// Election Primaries
export const getAllElectionPrimaries = async (): Promise<PrimaryElection[]> => {
  try {
    logger.info('Fetching all election primaries');
    const result = await prisma.election_primaries.findMany({
      include: {
        election: true,
        primary_candidates: true
      }
    });

    if (!result) {
      return [];
    }

    const primaries = await Promise.all(result
      .filter(primary => primary.election !== null)
      .map(async primary => {
        // Get candidate count using Prisma's count method
        const count = await prisma.election_candidates.count({
          where: {
            candidates_of_primaries: {
              some: {
                id: primary.id
              }
            }
          }
        });

        return {
          id: primary.id,
          title: primary.title || '',
          description: primary.description || '',
          type: primary.type || 0,
          position: primary.position || 0,
          status: primary.status || 0,
          reviewed: primary.reviewed || false,
          approved: primary.approved || false,
          votesactive: primary.votesactive || false,
          openvote: primary.openvote,
          closevote: primary.closevote,
          created: primary.created || new Date(),
          snapshot: primary.snapshot,
          candidate_count: count,
          candidates: primary.primary_candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name || '',
            twitter: candidate.twitter || '',
            discord: candidate.discord || '',
            telegram: candidate.telegram || '',
            created: candidate.created || new Date(),
            data: candidate.data ? Buffer.from(candidate.data) : Buffer.alloc(0),
            type: candidate.type || 0,
            status: candidate.status || 0,
            wallet: candidate.wallet || 0,
            nominations: candidate.nominations || 0
          })),
          parent_election_id: primary.election_id,
          election: {
            id: primary.election.id,
            title: primary.election.title || '',
            description: primary.election.description || '',
            reviewed: primary.election.reviewed || false,
            approved: primary.election.approved || false,
            votesactive: primary.election.votesactive || false,
            openvote: primary.election.openvote?.toISOString() || null,
            closevote: primary.election.closevote?.toISOString() || null,
            created: primary.election.created?.toISOString() || new Date().toISOString(),
            type: primary.election.type || 0,
            position: primary.election.position || 0,
            status: primary.election.status || 0,
            snapshot: primary.election.snapshot,
            wallet: null,
            candidate_count: count,
          }
        };
      }));

    return primaries;
  } catch (error) {
    logger.error({ error }, 'Error fetching election primaries');
    throw error;
  }
};

/**
 * @deprecated This function is no longer used by the frontend (kat-gov-web).
 * See routes/govRoutes.ts for more information on deprecated routes.
 */
export async function createElectionPrimary(electionId: number): Promise<any> {
  try {
    // 1. Check if election exists and isn't already in a primary
    const existingPrimary = await prisma.election_primaries.findFirst({
      where: {
        election_id: electionId
      }
    });

    if (existingPrimary) {
      throw new Error('Primary already exists for this election');
    }

    // 2. Get the election data
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        election_types: true,
        election_positions: true,
        election_statuses: true
      }
    });

    if (!election) {
      throw new Error('Election not found');
    }

    // 3. Create a new snapshot
    const newSnapshot = await prisma.election_snapshots.create({
      data: {
        generated: new Date(),
        data: {}, // You'll need to implement the snapshot data generation
        proposal_id: null
      }
    });

    // 4. Create the primary record
    const primary = await prisma.election_primaries.create({
      data: {
        title: `Primary: ${election.title}`,
        description: `Primary: ${election.description}`,
        reviewed: true,
        approved: null,
        votesactive: null,
        openvote: null,
        closevote: null,
        created: new Date(),
        type: election.type,
        position: election.position,
        status: 4, // Assuming 4 is the correct status ID
        snapshot: newSnapshot.id,
        election_id: electionId
      }
    });

    return primary;
  } catch (error) {
    console.error('Error creating election primary:', error);
    throw error;
  }
}
  