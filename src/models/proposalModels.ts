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
import { calculateVoteWeight, validateVoteAmount } from '../utils/voteCalculator.js';

const logger = createModuleLogger('proposalModels');

// Proposals
export const createProposal = async (proposal: {
  title: string;
  description: string;
  body?: string;
  type: number | null;
  approved?: boolean;
  reviewed?: boolean;
  passed?: boolean;
  submitted: Date;
  votesactive?: boolean;
  status: number;
  wallet: number;
  openvote?: Date;
  closevote?: Date;
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
      votesactive, 
      status, 
      wallet,
      openvote,
      closevote
    } = proposal;
    
    logger.info({ title, status, wallet }, 'Creating proposal');
    
    // Convert to database format
    const createData = {
      title,
      description,
      body,
      type,
      submitted,
      reviewed: reviewed ?? false,
      approved: approved ?? false,
      passed: passed ?? false,
      votesactive: votesactive ?? false,
      status,
      wallet,
      openvote,
      closevote
    };
    
    const result = await prisma.proposals.create({
      data: createData,
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true,
        proposal_types: true
      }
    });

    // Transform the result to match frontend expectations
    const transformedResult = {
      ...result,
      votesActive: result.votesactive,
      proposal_wallets_proposals_walletToproposal_wallets: result.proposal_wallets_proposals_walletToproposal_wallets ? {
        address: result.proposal_wallets_proposals_walletToproposal_wallets.address
      } : null,
      proposal_statuses: result.proposal_statuses ? {
        id: result.proposal_statuses.id,
        name: result.proposal_statuses.name,
        active: result.proposal_statuses.active
      } : null,
      proposal_types: result.proposal_types ? {
        id: result.proposal_types.id,
        name: result.proposal_types.name,
        simplevote: result.proposal_types.simplevote
      } : null
    };

    logger.debug({ id: result.id }, 'Proposal created successfully');
    return transformedResult as unknown as Proposal;
  } catch (error) {
    logger.error({ error, proposal }, 'Error creating proposal');
    throw new Error('Could not create proposal');
  }
};

export const getAllProposals = async (params: {
  title?: string;
  status?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<Proposal[]> => {
  try {
    const { title, status, sort = 'submitted', limit = 100, offset = 0 } = params;
    logger.info({ params }, 'Fetching proposals');

    const where: any = {};
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const orderBy: any = {};
    orderBy[sort] = 'desc';

    const result = await prisma.proposals.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true,
        proposal_types: true
      }
    });

    // Transform results to match frontend expectations
    const transformedResults = result.map(proposal => ({
      ...proposal,
      votesActive: proposal.votesactive,
      proposal_wallets_proposals_walletToproposal_wallets: proposal.proposal_wallets_proposals_walletToproposal_wallets ? {
        address: proposal.proposal_wallets_proposals_walletToproposal_wallets.address
      } : null,
      proposal_statuses: proposal.proposal_statuses ? {
        id: proposal.proposal_statuses.id,
        name: proposal.proposal_statuses.name,
        active: proposal.proposal_statuses.active
      } : null,
      proposal_types: proposal.proposal_types ? {
        id: proposal.proposal_types.id,
        name: proposal.proposal_types.name,
        simplevote: proposal.proposal_types.simplevote
      } : null
    }));

    logger.debug({ count: result.length }, 'Retrieved proposals');
    return transformedResults as unknown as Proposal[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposals');
    throw new Error('Could not fetch proposals');
  }
};

export const updateProposal = async (id: number, proposal: Partial<Proposal>): Promise<Proposal | null> => {
  try {
    logger.info({ id, ...proposal }, 'Updating proposal');
    
    // Convert frontend proposal to database format
    const updateData = {
      title: proposal.title,
      description: proposal.description,
      body: proposal.body,
      type: proposal.type,
      approved: proposal.approved,
      reviewed: proposal.reviewed,
      passed: proposal.passed,
      votesactive: proposal.votesActive ?? proposal.votesactive,
      status: proposal.status,
      wallet: proposal.wallet,
      openvote: proposal.openvote,
      closevote: proposal.closevote
    };
    
    const result = await prisma.proposals.update({
      where: { id },
      data: updateData,
      include: {
        proposal_statuses: true,
        proposal_wallets_proposals_walletToproposal_wallets: true,
        proposal_types: true
      }
    });

    if (result) {
      // Transform result to match frontend expectations
      const transformedResult = {
        ...result,
        votesActive: result.votesactive,
        proposal_wallets_proposals_walletToproposal_wallets: result.proposal_wallets_proposals_walletToproposal_wallets ? {
          address: result.proposal_wallets_proposals_walletToproposal_wallets.address
        } : null,
        proposal_statuses: result.proposal_statuses ? {
          id: result.proposal_statuses.id,
          name: result.proposal_statuses.name,
          active: result.proposal_statuses.active
        } : null,
        proposal_types: result.proposal_types ? {
          id: result.proposal_types.id,
          name: result.proposal_types.name,
          simplevote: result.proposal_types.simplevote
        } : null
      };
      
      logger.debug({ id }, 'Proposal updated successfully');
      return transformedResult as unknown as Proposal;
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
        proposal_wallets_proposals_walletToproposal_wallets: true,
        proposal_types: true
      }
    });

    if (result) {
      // Transform result to match frontend expectations
      const transformedResult = {
        ...result,
        votesActive: result.votesactive,
        proposal_wallets_proposals_walletToproposal_wallets: result.proposal_wallets_proposals_walletToproposal_wallets ? {
          address: result.proposal_wallets_proposals_walletToproposal_wallets.address
        } : null,
        proposal_statuses: result.proposal_statuses ? {
          id: result.proposal_statuses.id,
          name: result.proposal_statuses.name,
          active: result.proposal_statuses.active
        } : null,
        proposal_types: result.proposal_types ? {
          id: result.proposal_types.id,
          name: result.proposal_types.name,
          simplevote: result.proposal_types.simplevote
        } : null
      };

      logger.debug({ id }, 'Proposal retrieved successfully');
      return transformedResult as unknown as Proposal;
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
    const { proposal_id, toaddress, amountsent } = vote;
    if (!proposal_id || !toaddress || !amountsent) {
      throw new Error('Missing required fields for vote');
    }

    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal yes vote');

    // Get proposal and its snapshot
    const proposal = await getProposalById(proposal_id);
    if (!proposal || !proposal.snapshot) {
      throw new Error('Proposal or snapshot not found');
    }

    const snapshot = await prisma.proposal_snapshots.findUnique({
      where: { id: Number(proposal.snapshot) }
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
    
    const result = await prisma.proposal_yes_votes.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        votescounted: voteWeight.votes,
        validvote: true,
        proposal_snapshot_id: Number(proposal.snapshot),
        created: new Date()
      },
      include: {
        proposals_proposal_yes_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });

    logger.debug({ 
      id: result.id, 
      votes: voteWeight.votes,
      powerLevel: voteWeight.powerLevel 
    }, 'Proposal yes vote created successfully');
    
    return result as unknown as ProposalYesVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal yes vote');
    throw error;
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
    const { proposal_id, toaddress, amountsent } = vote;
    if (!proposal_id || !toaddress || !amountsent) {
      throw new Error('Missing required fields for vote');
    }

    logger.info({ proposal_id, toaddress, amountsent }, 'Creating proposal no vote');

    // Get proposal and its snapshot
    const proposal = await getProposalById(proposal_id);
    if (!proposal || !proposal.snapshot) {
      throw new Error('Proposal or snapshot not found');
    }

    const snapshot = await prisma.proposal_snapshots.findUnique({
      where: { id: Number(proposal.snapshot) }
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
    
    const result = await prisma.proposal_no_votes.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        votescounted: voteWeight.votes,
        validvote: true,
        proposal_snapshot_id: Number(proposal.snapshot),
        created: new Date()
      },
      include: {
        proposals_proposal_no_votes_proposal_idToproposals: true,
        proposal_snapshots: true
      }
    });

    logger.debug({ 
      id: result.id, 
      votes: voteWeight.votes,
      powerLevel: voteWeight.powerLevel 
    }, 'Proposal no vote created successfully');
    
    return result as unknown as ProposalNoVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating proposal no vote');
    throw error;
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
    const { proposal_id, toaddress, amountsent, validvote, fromaddress, hash } = nomination;
    logger.info({ proposal_id, toaddress, amountsent, fromaddress }, 'Creating proposal nomination');
    const result = await prisma.proposal_nominations.create({
      data: {
        proposal_id,
        toaddress,
        amountsent,
        validvote,
        fromaddress,
        hash,
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
    return result.map(type => ({
      id: type.id,
      name: type.name || '',
      simple: type.simplevote || false
    })) as ProposalType[];
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal types');
    throw new Error('Could not fetch proposal types');
  }
};

export const createProposalType = async (name: string, simple: boolean): Promise<ProposalType> => {
  try {
    logger.info({ name, simple }, 'Creating proposal type');
    const result = await prisma.proposal_types.create({
      data: {
        name,
        simplevote: simple
      }
    });
    logger.debug({ id: result.id }, 'Proposal type created successfully');
    return {
      id: result.id,
      name: result.name || '',
      simple: result.simplevote || false
    } as ProposalType;
  } catch (error) {
    logger.error({ error, name, simple }, 'Error creating proposal type');
    throw new Error('Could not create proposal type');
  }
};

export const updateProposalType = async (id: number, name: string, simple: boolean): Promise<ProposalType> => {
  try {
    logger.info({ id, name, simple }, 'Updating proposal type');
    const result = await prisma.proposal_types.update({
      where: { id },
      data: {
        name,
        simplevote: simple
      }
    });
    logger.debug({ id }, 'Proposal type updated successfully');
    return {
      id: result.id,
      name: result.name || '',
      simple: result.simplevote || false
    } as ProposalType;
  } catch (error) {
    logger.error({ error, id, name, simple }, 'Error updating proposal type');
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
    return result.map(status => ({
      id: status.id,
      name: status.name || '',
      active: status.active || false
    })) as ProposalStatus[];
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
    return {
      id: result.id,
      name: result.name || '',
      active: result.active || false
    } as ProposalStatus;
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
    return {
      id: result.id,
      name: result.name || '',
      active: result.active || false
    } as ProposalStatus;
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
        AND: [
          {
            OR: [
              { title: 'A draft proposal, please replace with the title of your proposal.' },
              { description: 'Please replace this text with a short description of your proposal.' },
              { title: { contains: 'test', mode: 'insensitive' } },
              { title: { contains: 'ashton test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'ashton test', mode: 'insensitive' } }
            ]
          },
          {
            submitted: {
              lt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
            }
          }
        ]
      }
    });

    logger.info({ count: result.count }, 'Old draft proposals deleted successfully');
    return result.count;
  } catch (error) {
    logger.error({ error }, 'Error deleting old draft proposals');
    throw new Error('Could not delete old draft proposals');
  }
};

// Count active proposals
export const countActiveProposals = async (): Promise<number> => {
  try {
    logger.info('Counting active proposals');
    
    // First get the active status ID
    const activeStatus = await prisma.proposal_statuses.findFirst({
      where: {
        name: 'Active',
        active: true
      }
    });

    if (!activeStatus) {
      logger.warn('No active status found in proposal_statuses');
      return 0;
    }

    const count = await prisma.proposals.count({
      where: {
        status: activeStatus.id
      }
    });

    logger.debug({ count }, 'Active proposals counted successfully');
    return Number(count);
  } catch (error) {
    logger.error({ error }, 'Error counting active proposals');
    throw new Error('Could not count active proposals');
  }
};

// Get nominations for a specific proposal
export const getNominationsForProposal = async (proposalId: number): Promise<ProposalNomination[]> => {
  try {
    logger.info({ proposalId }, 'Fetching nominations for proposal');
    const nominations = await prisma.proposal_nominations.findMany({
      where: {
        proposal_id: Number(proposalId)
      },
      orderBy: {
        created: 'desc'
      },
      select: {
        id: true,
        created: true,
        hash: true,
        toaddress: true,
        fromaddress: true,
        amountsent: true,
        validvote: true,
        proposal_id: true
      }
    });
    
    // Transform the nominations to match the ProposalNomination interface
    const transformedNominations = nominations.map(nom => {
      const nomination: ProposalNomination = {
        id: nom.id,
        created: nom.created ?? undefined,
        hash: nom.hash ?? undefined,
        toaddress: nom.toaddress ?? undefined,
        fromaddress: nom.fromaddress ?? undefined,
        amountsent: nom.amountsent ?? undefined,
        validvote: nom.validvote ?? undefined,
        proposal_id: nom.proposal_id ?? undefined
      };
      return nomination;
    });
    
    logger.debug({ proposalId, count: transformedNominations.length }, 'Retrieved nominations for proposal');
    return transformedNominations;
  } catch (error) {
    logger.error({ error, proposalId }, 'Error fetching nominations for proposal');
    throw new Error('Could not fetch nominations for proposal');
  }
};

// Count nominations for a specific proposal
export const countNominationsForProposal = async (proposalId: number): Promise<number> => {
  try {
    logger.info({ proposalId }, 'Counting nominations for proposal');
    
    // First check if proposal exists
    const proposal = await prisma.proposals.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      logger.warn({ proposalId }, 'Proposal not found');
      throw new Error('Proposal not found');
    }

    const count = await prisma.proposal_nominations.count({
      where: {
        proposal_id: proposalId
      }
    });
    logger.debug({ proposalId, count }, 'Nominations counted successfully');
    return count;
  } catch (error) {
    logger.error({ error, proposalId }, 'Error counting nominations for proposal');
    throw new Error(error instanceof Error && error.message === 'Proposal not found' 
      ? 'Proposal not found' 
      : 'Could not count nominations for proposal');
  }
}; 