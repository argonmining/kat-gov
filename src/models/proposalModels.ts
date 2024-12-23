import { prisma } from '../config/prisma.js';
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
export const createProposal = async (proposal: {
  title: string;
  description: string;
  body?: string;
  type: number;
  approved?: boolean;
  reviewed?: boolean;
  passed?: boolean;
  submitted: Date;
  votesActive?: boolean;
  status: number;
  wallet: number;
}): Promise<Proposal> => {
  try {
    const { 
      title, 
      description, 
      body, 
      type, 
      submitted, 
      reviewed, 
      approved, 
      passed, 
      votesActive, 
      status, 
      wallet 
    } = proposal;
    
    logger.info({ title, status, wallet }, 'Creating proposal');
    
    const result = await prisma.proposals.create({
      data: {
        title,
        description,
        body,
        type,
        submitted,
        reviewed: reviewed ?? false,
        approved: approved ?? false,
        passed: passed ?? false,
        votesactive: votesActive ?? false,
        status,
        wallet
      },
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true
      }
    });

    logger.debug({ id: result.id }, 'Proposal created successfully');
    return result as unknown as Proposal;
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

    const where: any = {};
    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort] = 'asc';
    } else {
      orderBy.submitted = 'desc'; // Default sort by submission date
    }

    const result = await prisma.proposals.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true
      }
    });

    logger.debug({ count: result.length }, 'Retrieved proposals');
    return result as unknown as Proposal[];
  } catch (error) {
    logger.error({ error, filters, sort, limit, offset }, 'Error fetching proposals');
    throw new Error('Could not fetch proposals');
  }
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  try {
    logger.info({ id, ...proposal }, 'Updating proposal');
    
    const result = await prisma.proposals.update({
      where: { id },
      data: proposal,
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true
      }
    });

    if (result) {
      logger.debug({ id }, 'Proposal updated successfully');
      return result as unknown as Proposal;
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
    await prisma.proposals.delete({
      where: { id }
    });
    logger.debug({ id }, 'Proposal deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal');
    throw new Error('Could not delete proposal');
  }
};

export const getProposalById = async (id: number): Promise<Proposal | null> => {
  try {
    logger.info({ id }, 'Fetching proposal by ID');
    const result = await prisma.proposals.findUnique({
      where: { id },
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true
      }
    });

    if (result) {
      logger.debug({ id }, 'Proposal retrieved successfully');
      return result as unknown as Proposal;
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
    const { proposal_id, toaddress, amountsent, votescounted, validvote, proposal_snapshot_id } = vote;
    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal vote');
    
    // Note: This is a base class that both yes and no votes extend from
    // The actual implementation should use either proposal_yes_votes or proposal_no_votes
    throw new Error('Use createProposalYesVote or createProposalNoVote instead');
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal vote');
    throw new Error('Could not create proposal vote');
  }
};

export const getVotesForProposal = async (proposalId: number): Promise<ProposalVote[]> => {
  try {
    logger.info({ proposalId }, 'Fetching votes for proposal');
    
    // Fetch both yes and no votes
    const yesVotes = await prisma.proposal_yes_votes.findMany({
      where: {
        proposal_id: proposalId
      },
      include: {
        proposals_proposal_yes_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });

    const noVotes = await prisma.proposal_no_votes.findMany({
      where: {
        proposal_id: proposalId
      },
      include: {
        proposals_proposal_no_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });

    // Combine and return all votes
    const allVotes = [...yesVotes, ...noVotes];
    logger.debug({ count: allVotes.length }, 'Retrieved proposal votes');
    return allVotes as unknown as ProposalVote[];
  } catch (error) {
    logger.error({ error, proposalId }, 'Error fetching votes for proposal');
    throw new Error('Could not fetch votes for proposal');
  }
};

// Proposal Yes Votes
export const getAllProposalYesVotes = async (): Promise<ProposalYesVote[]> => {
  try {
    logger.info('Fetching all proposal yes votes');
    const result = await prisma.proposal_yes_votes.findMany({
      include: {
        proposals_proposal_yes_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all proposal yes votes');
    return result as unknown as ProposalYesVote[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal yes votes');
    throw new Error('Could not fetch proposal yes votes');
  }
};

export const createProposalYesVote = async (vote: Omit<ProposalYesVote, 'id' | 'created'>): Promise<ProposalYesVote> => {
  try {
    const { proposal_id, toaddress, amountsent, votescounted, validvote } = vote;
    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal yes vote');
    const result = await prisma.proposal_yes_votes.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        votescounted,
        validvote,
        created: new Date()
      },
      include: {
        proposals_proposal_yes_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ id: result.id }, 'Proposal yes vote created successfully');
    return result as unknown as ProposalYesVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal yes vote');
    throw new Error('Could not create proposal yes vote');
  }
};

export const updateProposalYesVote = async (id: number, vote: Partial<ProposalYesVote>): Promise<ProposalYesVote> => {
  try {
    logger.info({ id, ...vote }, 'Updating proposal yes vote');
    const result = await prisma.proposal_yes_votes.update({
      where: { id },
      data: vote,
      include: {
        proposals_proposal_yes_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ id }, 'Proposal yes vote updated successfully');
    return result as unknown as ProposalYesVote;
  } catch (error) {
    logger.error({ error, id, vote }, 'Error updating proposal yes vote');
    throw new Error('Could not update proposal yes vote');
  }
};

export const deleteProposalYesVote = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal yes vote');
    await prisma.proposal_yes_votes.delete({
      where: { id }
    });
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
    const result = await prisma.proposal_no_votes.findMany({
      include: {
        proposals_proposal_no_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all proposal no votes');
    return result as unknown as ProposalNoVote[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal no votes');
    throw new Error('Could not fetch proposal no votes');
  }
};

export const createProposalNoVote = async (vote: Omit<ProposalNoVote, 'id' | 'created'>): Promise<ProposalNoVote> => {
  try {
    const { proposal_id, toaddress, amountsent, votescounted, validvote } = vote;
    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal no vote');
    const result = await prisma.proposal_no_votes.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        votescounted,
        validvote,
        created: new Date()
      },
      include: {
        proposals_proposal_no_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ id: result.id }, 'Proposal no vote created successfully');
    return result as unknown as ProposalNoVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal no vote');
    throw new Error('Could not create proposal no vote');
  }
};

export const updateProposalNoVote = async (id: number, vote: Partial<ProposalNoVote>): Promise<ProposalNoVote> => {
  try {
    logger.info({ id, ...vote }, 'Updating proposal no vote');
    const result = await prisma.proposal_no_votes.update({
      where: { id },
      data: vote,
      include: {
        proposals_proposal_no_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });
    logger.debug({ id }, 'Proposal no vote updated successfully');
    return result as unknown as ProposalNoVote;
  } catch (error) {
    logger.error({ error, id, vote }, 'Error updating proposal no vote');
    throw new Error('Could not update proposal no vote');
  }
};

export const deleteProposalNoVote = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal no vote');
    await prisma.proposal_no_votes.delete({
      where: { id }
    });
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
    const result = await prisma.proposal_nominations.findMany({
      include: {
        proposals: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all proposal nominations');
    return result as unknown as ProposalNomination[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal nominations');
    throw new Error('Could not fetch proposal nominations');
  }
};

export const createProposalNomination = async (nomination: Omit<ProposalNomination, 'id'>): Promise<ProposalNomination> => {
  try {
    const { proposal_id, toaddress, amountsent, validvote } = nomination;
    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal nomination');
    const result = await prisma.proposal_nominations.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        validvote,
        created: new Date()
      },
      include: {
        proposals: true
      }
    });
    logger.debug({ id: result.id }, 'Proposal nomination created successfully');
    return result as unknown as ProposalNomination;
  } catch (error) {
    logger.error({ error, nomination }, 'Error creating proposal nomination');
    throw new Error('Could not create proposal nomination');
  }
};

export const updateProposalNomination = async (id: number, nomination: Partial<ProposalNomination>): Promise<ProposalNomination> => {
  try {
    const { amountsent, validvote } = nomination;
    logger.info({ id, amountsent }, 'Updating proposal nomination');
    const result = await prisma.proposal_nominations.update({
      where: { id },
      data: {
        amountsent,
        validvote
      },
      include: {
        proposals: true
      }
    });
    logger.debug({ id }, 'Proposal nomination updated successfully');
    return result as unknown as ProposalNomination;
  } catch (error) {
    logger.error({ error, id, nomination }, 'Error updating proposal nomination');
    throw new Error('Could not update proposal nomination');
  }
};

export const deleteProposalNomination = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal nomination');
    await prisma.proposal_nominations.delete({
      where: { id }
    });
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
    const result = await prisma.proposal_types.findMany();
    logger.debug({ count: result.length }, 'Retrieved all proposal types');
    return result as unknown as ProposalType[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal types');
    throw new Error('Could not fetch proposal types');
  }
};

export const createProposalType = async (name: string, simplevote: boolean): Promise<ProposalType> => {
  try {
    logger.info({ name, simplevote }, 'Creating proposal type');
    const result = await prisma.proposal_types.create({
      data: {
        name,
        simplevote
      }
    });
    logger.debug({ id: result.id }, 'Proposal type created successfully');
    return result as unknown as ProposalType;
  } catch (error) {
    logger.error({ error, name, simplevote }, 'Error creating proposal type');
    throw new Error('Could not create proposal type');
  }
};

export const updateProposalType = async (id: number, name: string, simplevote: boolean): Promise<ProposalType> => {
  try {
    logger.info({ id, name, simplevote }, 'Updating proposal type');
    const result = await prisma.proposal_types.update({
      where: { id },
      data: {
        name,
        simplevote
      }
    });
    logger.debug({ id }, 'Proposal type updated successfully');
    return result as unknown as ProposalType;
  } catch (error) {
    logger.error({ error, id, name, simplevote }, 'Error updating proposal type');
    throw new Error('Could not update proposal type');
  }
};

export const deleteProposalType = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal type');
    await prisma.proposal_types.delete({
      where: { id }
    });
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
    const result = await prisma.proposal_statuses.findMany();
    logger.debug({ count: result.length }, 'Retrieved all proposal statuses');
    return result as unknown as ProposalStatus[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal statuses');
    throw new Error('Could not fetch proposal statuses');
  }
};

export const createProposalStatus = async (name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    logger.info({ name, active }, 'Creating proposal status');
    const result = await prisma.proposal_statuses.create({
      data: {
        name,
        active
      }
    });
    logger.debug({ id: result.id }, 'Proposal status created successfully');
    return result as unknown as ProposalStatus;
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating proposal status');
    throw new Error('Could not create proposal status');
  }
};

export const updateProposalStatus = async (id: number, name: string, active: boolean): Promise<ProposalStatus> => {
  try {
    logger.info({ id, name, active }, 'Updating proposal status');
    const result = await prisma.proposal_statuses.update({
      where: { id },
      data: {
        name,
        active
      }
    });
    logger.debug({ id }, 'Proposal status updated successfully');
    return result as unknown as ProposalStatus;
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating proposal status');
    throw new Error('Could not update proposal status');
  }
};

export const deleteProposalStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal status');
    await prisma.proposal_statuses.delete({
      where: { id }
    });
    logger.debug({ id }, 'Proposal status deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting proposal status');
    throw new Error('Could not delete proposal status');
  }
};

// Proposal Wallet
export const createProposalWallet = async (address: string, encryptedprivatekey: string): Promise<ProposalWallet> => {
  try {
    logger.info({ address }, 'Creating proposal wallet');
    const result = await prisma.proposal_wallets.create({
      data: {
        address,
        encryptedprivatekey,
        balance: 0,
        timestamp: new Date(),
        active: true
      }
    });
    logger.debug({ id: result.id }, 'Proposal wallet created successfully');
    return result as unknown as ProposalWallet;
  } catch (error) {
    logger.error({ error, address }, 'Error creating proposal wallet');
    throw new Error('Could not create proposal wallet');
  }
};

// Proposal Snapshots
export const getAllProposalSnapshots = async (): Promise<ProposalSnapshot[]> => {
  try {
    logger.info('Fetching all proposal snapshots');
    const result = await prisma.proposal_snapshots.findMany({
      include: {
        proposals_proposal_snapshots_proposal_idToproposals: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all proposal snapshots');
    return result as unknown as ProposalSnapshot[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal snapshots');
    throw new Error('Could not fetch proposal snapshots');
  }
};

export const createProposalSnapshot = async (proposal_id: number, data: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    logger.info({ proposal_id, data }, 'Creating proposal snapshot');
    const result = await prisma.proposal_snapshots.create({
      data: {
        proposal_id,
        data,
        generated: new Date()
      },
      include: {
        proposals_proposal_snapshots_proposal_idToproposals: true
      }
    });
    logger.debug({ id: result.id }, 'Proposal snapshot created successfully');
    return result as unknown as ProposalSnapshot;
  } catch (error) {
    logger.error({ error, proposal_id, data }, 'Error creating proposal snapshot');
    throw new Error('Could not create proposal snapshot');
  }
};

export const updateProposalSnapshot = async (id: number, data: Record<string, any>): Promise<ProposalSnapshot> => {
  try {
    logger.info({ id, data }, 'Updating proposal snapshot');
    const result = await prisma.proposal_snapshots.update({
      where: { id },
      data: {
        data
      },
      include: {
        proposals_proposal_snapshots_proposal_idToproposals: true
      }
    });
    logger.debug({ id }, 'Proposal snapshot updated successfully');
    return result as unknown as ProposalSnapshot;
  } catch (error) {
    logger.error({ error, id, data }, 'Error updating proposal snapshot');
    throw new Error('Could not update proposal snapshot');
  }
};

export const deleteProposalSnapshot = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting proposal snapshot');
    await prisma.proposal_snapshots.delete({
      where: { id }
    });
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
    const result = await prisma.proposals.deleteMany({
      where: {
        reviewed: false,
        submitted: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      }
    });
    logger.debug({ count: result.count }, 'Deleted old draft proposals');
    return result.count;
  } catch (error) {
    logger.error({ error }, 'Error deleting old draft proposals');
    throw new Error('Could not delete old draft proposals');
  }
}; 