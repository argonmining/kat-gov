import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  createProposalWallet,
  getAllProposalSnapshots,
  createProposalSnapshot,
  updateProposalSnapshot,
  deleteProposalSnapshot,
  createProposalVote,
  getVotesForProposal,
  createProposalYesVote,
  getAllProposalYesVotes,
  createProposalNoVote,
  getAllProposalNoVotes,
  createProposalNomination,
  getAllProposalNominations,
  updateProposalNomination,
  deleteProposalNomination,
  getAllProposalTypes,
  createProposalType,
  updateProposalType,
  deleteProposalType,
  getAllProposalStatuses,
  createProposalStatus,
  updateProposalStatus,
  deleteProposalStatus,
  getNominationsForProposal,
  countActiveProposals,
  countNominationsForProposal
} from '../models/proposalModels.js';
import {
  Proposal,
  ProposalVote,
  ProposalYesVote,
  ProposalNoVote,
  ProposalNomination,
  ProposalType,
  ProposalStatus,
  ProposalSnapshot,
  ProposalWallet
} from '../types/proposalTypes.js';
import { proposalSubmissionFee, proposalNominationFee } from '../utils/tokenCalcs.js';
import { createKaspaWallet } from '../utils/walletUtils.js';
import { calculateVoteWeight } from '../utils/voteCalculator.js';
import { config, GOV_ADDRESS, YES_ADDRESS, NO_ADDRESS, GOV_TOKEN_TICKER } from '../config/env.js';
import { getKRC20OperationList } from '../services/kasplexAPI.js';

const logger = createModuleLogger('proposalController');

// Proposals
export const submitProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalData = req.body;
    logger.info({ proposalData }, 'Submitting proposal');
    
    // First create a new Kaspa wallet if one wasn't provided
    let wallet;
    if (!proposalData.wallet) {
      const { address, encryptedPrivateKey } = await createKaspaWallet();
      wallet = await createProposalWallet(address, encryptedPrivateKey);
    }
    
    // Now create the proposal with all the frontend data plus the new wallet
    const newProposal = await createProposal({
      title: proposalData.title,
      description: proposalData.description || '',
      body: proposalData.body || '',
      type: proposalData.type || null,
      submitted: new Date(),
      reviewed: false,
      approved: false,
      passed: false,
      votesactive: false,
      status: proposalData.status || 1, // Default to draft status if not provided
      wallet: wallet?.id || proposalData.wallet
    });

    // Fetch the complete proposal with related data
    const completeProposal = await getProposalById(newProposal.id);
    
    logger.info({ proposalId: newProposal.id }, 'Proposal submitted successfully');
    res.status(201).json(completeProposal);
  } catch (error) {
    logger.error({ error, proposal: req.body }, 'Error submitting proposal');
    next(error);
  }
};

export const fetchAllProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      title,
      sort = 'submitted',
      limit = 100,
      offset = 0
    } = req.query;

    logger.info({ 
      query: req.query,
      url: req.url,
      method: req.method
    }, 'Incoming proposal fetch request');

    // Get status ID if status name is provided
    let statusId: number | undefined;
    if (status) {
      const statuses = await getAllProposalStatuses();
      const statusObj = statuses.find(s => s.name.toLowerCase() === (status as string).toLowerCase());
      if (statusObj) {
        statusId = statusObj.id;
      }
    }

    const proposals = await getAllProposals({
      title: title as string,
      status: statusId,
      sort: sort as string,
      limit: Number(limit),
      offset: Number(offset)
    });

    res.status(200).json(proposals);
  } catch (error) {
    logger.error({ error, query: req.query }, 'Error fetching proposals');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const modifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      type: req.body.type,
      status: req.body.status,
      reviewed: req.body.reviewed,
      approved: req.body.approved,
      passed: req.body.passed,
      votesactive: req.body.votesActive
    };

    logger.info({ proposalId, updates: updateData }, 'Modifying proposal');
    const updatedProposal = await updateProposal(proposalId, updateData);
    
    if (updatedProposal) {
      // Fetch fresh data with all relations
      const completeProposal = await getProposalById(proposalId);
      logger.info({ proposalId }, 'Proposal updated successfully');
      res.status(200).json(completeProposal);
    } else {
      logger.warn({ proposalId }, 'Proposal not found');
      res.status(404).json({ error: 'Proposal not found' });
    }
  } catch (error) {
    logger.error({ error, proposalId: req.params.id }, 'Error modifying proposal');
    next(error);
  }
};

export const removeProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.proposalId }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId }, 'Removing proposal');
    await deleteProposal(proposalId);
    logger.info({ proposalId }, 'Proposal deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, proposalId: req.params.proposalId }, 'Error removing proposal');
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
};

export const fetchProposalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId }, 'Fetching proposal by ID');
    const proposal = await getProposalById(proposalId);
    
    if (!proposal) {
      logger.warn({ proposalId }, 'Proposal not found');
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    logger.debug({ proposalId }, 'Proposal retrieved successfully');
    res.status(200).json(proposal);
  } catch (error) {
    logger.error({ error, proposalId: req.params.id }, 'Error fetching proposal');
    next(error);
  }
};

// Proposal Votes
export const submitProposalVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { proposal_id, toaddress, amountsent } = req.body;
    logger.info({ proposal_id, toaddress, amountsent }, 'Submitting proposal vote');
    
    // Calculate vote weight
    const voteWeight = calculateVoteWeight(amountsent);
    
    const newVote = await createProposalVote({
      proposal_id,
      toaddress,
      amountsent: new Decimal(amountsent.toString()),
      votescounted: voteWeight.votes,
      validvote: true,
      proposal_snapshot_id: undefined  // Let the database handle the default value
    });

    logger.info({ voteId: newVote.id }, 'Vote submitted successfully');
    res.status(201).json(newVote);
  } catch (error) {
    logger.error({ error, vote: req.body }, 'Error submitting vote');
    next(error);
  }
};

export const fetchVotesForProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.proposalId }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId }, 'Fetching votes for proposal');
    const votes = await getVotesForProposal(proposalId);
    logger.debug({ proposalId, voteCount: votes.length }, 'Votes retrieved successfully');
    res.status(200).json(votes);
  } catch (error) {
    logger.error({ error, proposalId: req.params.proposalId }, 'Error fetching votes for proposal');
    res.status(500).json({ error: 'Failed to fetch votes for proposal' });
  }
};

// Proposal Yes Votes
export const fetchAllProposalYesVotes = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all proposal yes votes');
    const votes = await getAllProposalYesVotes();
    res.status(200).json(votes);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal yes votes');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitProposalYesVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proposal_id, toaddress, amountsent } = req.body;
    logger.info({ proposal_id, toaddress, amountsent }, 'Submitting proposal yes vote');
    
    // Calculate vote weight
    const voteWeight = calculateVoteWeight(amountsent);
    
    const newVote = await createProposalYesVote({
      proposal_id,
      toaddress,
      amountsent: new Decimal(amountsent.toString()),
      votescounted: voteWeight.votes,
      validvote: true
    });

    logger.info({ voteId: newVote.id }, 'Yes vote submitted successfully');
    res.status(201).json(newVote);
  } catch (error) {
    logger.error({ error, vote: req.body }, 'Error submitting yes vote');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

// Proposal No Votes
export const fetchAllProposalNoVotes = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all proposal no votes');
    const votes = await getAllProposalNoVotes();
    res.status(200).json(votes);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal no votes');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitProposalNoVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proposal_id, toaddress, amountsent } = req.body;
    logger.info({ proposal_id, toaddress, amountsent }, 'Submitting proposal no vote');
    
    // Calculate vote weight
    const voteWeight = calculateVoteWeight(amountsent);
    
    const newVote = await createProposalNoVote({
      proposal_id,
      toaddress,
      amountsent: new Decimal(amountsent.toString()),
      votescounted: voteWeight.votes,
      validvote: true
    });

    logger.info({ voteId: newVote.id }, 'No vote submitted successfully');
    res.status(201).json(newVote);
  } catch (error) {
    logger.error({ error, vote: req.body }, 'Error submitting no vote');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

// Proposal Nominations
export const fetchAllProposalNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all proposal nominations');
    const nominations = await getAllProposalNominations();
    logger.debug({ nominationCount: nominations.length }, 'Nominations retrieved successfully');
    res.status(200).json(nominations);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal nominations');
    next(error);
  }
};

export const submitProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nomination: Omit<ProposalNomination, 'id'> = req.body;
    logger.info({ nomination }, 'Submitting proposal nomination');
    
    const newNomination = await createProposalNomination(nomination);
    logger.info({ nominationId: newNomination.id }, 'Nomination submitted successfully');
    res.status(201).json(newNomination);
  } catch (error) {
    logger.error({ error, nomination: req.body }, 'Error submitting nomination');
    next(error);
  }
};

export const modifyProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
      res.status(400).json({ error: 'Invalid nomination ID' });
      return;
    }

    const nominationData: Partial<ProposalNomination> = req.body;
    logger.info({ nominationId: id, updates: nominationData }, 'Modifying proposal nomination');
    
    const updatedNomination = await updateProposalNomination(id, nominationData);
    logger.info({ nominationId: id }, 'Nomination updated successfully');
    res.status(200).json(updatedNomination);
  } catch (error) {
    logger.error({ error, nominationId: req.params.id }, 'Error modifying nomination');
    next(error);
  }
};

export const removeProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
      res.status(400).json({ error: 'Invalid nomination ID' });
      return;
    }

    logger.info({ nominationId: id }, 'Removing proposal nomination');
    await deleteProposalNomination(id);
    logger.info({ nominationId: id }, 'Nomination deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, nominationId: req.params.id }, 'Error removing nomination');
    next(error);
  }
};

// Proposal Types
export const fetchAllProposalTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all proposal types');
    const types = await getAllProposalTypes();
    
    // Transform to match frontend expectations
    const transformedTypes = types.map(type => ({
      id: type.id,
      name: type.name || '',
      simple: type.simplevote || false
    }));
    
    logger.debug({ typeCount: types.length }, 'Proposal types retrieved successfully');
    res.status(200).json(transformedTypes);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal types');
    next(error);
  }
};

export const addProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, simple } = req.body;
    logger.info({ name, simple }, 'Adding proposal type');
    
    const newType = await createProposalType(name, simple);
    
    // Transform to match frontend expectations
    const transformedType = {
      id: newType.id,
      name: newType.name || '',
      simple: newType.simplevote || false
    };
    
    logger.info({ typeId: newType.id }, 'Proposal type created successfully');
    res.status(201).json(transformedType);
  } catch (error) {
    logger.error({ error, type: req.body }, 'Error adding proposal type');
    next(error);
  }
};

export const modifyProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    const { name, simple } = req.body;
    logger.info({ typeId: id, name, simple }, 'Modifying proposal type');
    
    const updatedType = await updateProposalType(id, name, simple);
    
    // Transform to match frontend expectations
    const transformedType = {
      id: updatedType.id,
      name: updatedType.name || '',
      simple: updatedType.simplevote || false
    };
    
    logger.info({ typeId: id }, 'Proposal type updated successfully');
    res.status(200).json(transformedType);
  } catch (error) {
    logger.error({ error, typeId: req.params.id }, 'Error modifying proposal type');
    next(error);
  }
};

export const removeProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    logger.info({ typeId: id }, 'Removing proposal type');
    await deleteProposalType(id);
    logger.info({ typeId: id }, 'Proposal type deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, typeId: req.params.id }, 'Error removing proposal type');
    next(error);
  }
};

// Proposal Status
export const fetchAllProposalStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all proposal statuses');
    const statuses = await getAllProposalStatuses();
    
    // Transform to match frontend expectations
    const transformedStatuses = statuses.map(status => ({
      id: status.id,
      name: status.name || '',
      active: status.active || false
    }));
    
    logger.debug({ statusCount: statuses.length }, 'Proposal statuses retrieved successfully');
    res.status(200).json(transformedStatuses);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal statuses');
    next(error);
  }
};

export const addProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    logger.info({ name, active }, 'Adding proposal status');
    
    const newStatus = await createProposalStatus(name, active);
    
    // Transform to match frontend expectations
    const transformedStatus = {
      id: newStatus.id,
      name: newStatus.name || '',
      active: newStatus.active || false
    };
    
    logger.info({ statusId: newStatus.id }, 'Proposal status created successfully');
    res.status(201).json(transformedStatus);
  } catch (error) {
    logger.error({ error, status: req.body }, 'Error adding proposal status');
    next(error);
  }
};

export const modifyProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
      res.status(400).json({ error: 'Invalid status ID' });
      return;
    }

    const { name, active } = req.body;
    logger.info({ statusId: id, name, active }, 'Modifying proposal status');
    
    const updatedStatus = await updateProposalStatus(id, name, active);
    
    // Transform to match frontend expectations
    const transformedStatus = {
      id: updatedStatus.id,
      name: updatedStatus.name || '',
      active: updatedStatus.active || false
    };
    
    logger.info({ statusId: id }, 'Proposal status updated successfully');
    res.status(200).json(transformedStatus);
  } catch (error) {
    logger.error({ error, statusId: req.params.id }, 'Error modifying proposal status');
    next(error);
  }
};

export const removeProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
      res.status(400).json({ error: 'Invalid status ID' });
      return;
    }

    logger.info({ statusId: id }, 'Removing proposal status');
    await deleteProposalStatus(id);
    logger.info({ statusId: id }, 'Proposal status deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, statusId: req.params.id }, 'Error removing proposal status');
    next(error);
  }
};

// Proposal Qualification
export const qualifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.proposalId }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId, updates: req.body }, 'Qualifying proposal');
    const updatedProposal = await updateProposal(proposalId, req.body);
    if (!updatedProposal) {
      logger.warn({ proposalId }, 'Proposal not found');
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    logger.debug({ proposalId }, 'Fetching proposal with wallet details');
    const proposalWithWallet = await getProposalById(proposalId);
    if (!proposalWithWallet) {
      logger.warn({ proposalId }, 'Proposal not found after update');
      res.status(404).json({ error: 'Proposal not found after update' });
      return;
    }

    logger.debug('Calculating proposal submission fee');
    const fee = await proposalSubmissionFee();

    logger.info({ proposalId, fee, wallet: proposalWithWallet.wallet }, 'Proposal qualified successfully');
    res.status(200).json({
      fee,
      wallet: proposalWithWallet.wallet,
    });
  } catch (error) {
    logger.error({ error, proposalId: req.params.proposalId }, 'Error qualifying proposal');
    next(error);
  }
};

// Proposal Snapshots
export const fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all proposal snapshots');
    const snapshots = await getAllProposalSnapshots();
    logger.debug({ snapshotCount: snapshots.length }, 'Snapshots retrieved successfully');
    res.status(200).json(snapshots);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal snapshots');
    next(error);
  }
};

export const submitProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { proposal_id, data } = req.body;
    logger.info({ proposal_id }, 'Creating proposal snapshot');
    
    const newSnapshot = await createProposalSnapshot(proposal_id, data as Record<string, any>);
    logger.info({ snapshotId: newSnapshot.id }, 'Snapshot created successfully');
    res.status(201).json(newSnapshot);
  } catch (error) {
    logger.error({ error, snapshot: req.body }, 'Error creating snapshot');
    next(error);
  }
};

export const modifyProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    const { data } = req.body;
    logger.info({ snapshotId: id }, 'Modifying proposal snapshot');
    
    const updatedSnapshot = await updateProposalSnapshot(id, data);
    logger.info({ snapshotId: id }, 'Snapshot updated successfully');
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error modifying proposal snapshot');
    next(error);
  }
};

export const removeProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    logger.info({ snapshotId: id }, 'Removing proposal snapshot');
    await deleteProposalSnapshot(id);
    logger.info({ snapshotId: id }, 'Snapshot deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error removing proposal snapshot');
    next(error);
  }
};

export const fetchNominationsForProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId }, 'Fetching nominations for proposal');
    const nominations = await getNominationsForProposal(proposalId);
    logger.debug({ proposalId, count: nominations.length }, 'Nominations retrieved successfully');
    res.status(200).json(nominations);
  } catch (error) {
    logger.error({ error, proposalId: req.params.id }, 'Error fetching nominations');
    next(error);
  }
};

export const fetchActiveProposalCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching active proposal count');
    const count = await countActiveProposals();
    logger.debug({ count }, 'Active proposal count retrieved successfully');
    res.status(200).json(count);
  } catch (error) {
    logger.error({ error }, 'Error fetching active proposal count');
    next(error);
  }
};

export const fetchNominationCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    logger.info({ proposalId }, 'Fetching nomination count for proposal');
    const count = await countNominationsForProposal(proposalId);
    logger.debug({ proposalId, count }, 'Nomination count retrieved successfully');
    res.status(200).json({ nominationCount: count });
  } catch (error) {
    logger.error({ error, proposalId: req.params.id }, 'Error fetching nomination count');
    if (error instanceof Error && error.message === 'Proposal not found') {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }
    next(error);
  }
};

// Config endpoint
export const getGovConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching governance configuration');
    const govConfig = {
      govTokenTicker: config.tokens.govTokenTicker,
      proposals: {
        submissionFeeUsd: config.proposals.submissionFeeUsd,
        nominationFeeUsd: config.proposals.nominationFeeUsd,
        votingFeeMin: config.proposals.votingFeeMin,
        votingFeeMax: config.proposals.votingFeeMax
      },
      candidates: {
        nominationFeeUsd: config.candidates.nominationFeeUsd
      },
      addresses: {
        gov: GOV_ADDRESS,
        yes: YES_ADDRESS,
        no: NO_ADDRESS
      }
    };
    
    res.status(200).json(govConfig);
  } catch (error) {
    logger.error({ error }, 'Error fetching governance configuration');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Nomination Fee Functions
export const getNominationFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching nomination fee');
    const fee = await proposalNominationFee();
    logger.debug({ fee }, 'Nomination fee retrieved successfully');
    res.status(200).json({ fee });
  } catch (error) {
    logger.error({ error }, 'Error fetching nomination fee');
    next(error);
  }
};

export const verifyNominationTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fee, proposalId } = req.body;
    logger.info({ proposalId, fee }, 'Starting nomination transaction verification');

    const proposal = await getProposalById(proposalId);
    if (!proposal || !proposal.proposal_wallets_proposals_walletToproposal_wallets) {
      logger.warn({ proposalId }, 'Proposal or wallet not found');
      res.status(404).json({ error: 'Proposal or wallet not found' });
      return;
    }

    const walletAddress = proposal.proposal_wallets_proposals_walletToproposal_wallets.address;
    if (!walletAddress) {
      logger.warn({ proposalId }, 'Wallet address not found');
      res.status(404).json({ error: 'Wallet address not found' });
      return;
    }

    // Convert fee to sompi (1 KAS = 100000000 sompi) using Decimal for precise math
    const targetAmount = new Decimal(fee).mul(new Decimal('100000000')).toNumber();
    logger.debug({ walletAddress, targetAmount, originalFee: fee }, 'Checking for transaction with calculated amount');

    // Generate a verification ID that includes the proposal ID, target amount, and timestamp
    const timestamp = Date.now();
    const verificationId = Buffer.from(`${proposalId}-${targetAmount}-${timestamp}`).toString('base64');

    // Send immediate response that verification has started
    res.status(202).json({ 
      status: 'pending',
      message: 'Verification process started',
      retryAfter: 3, // seconds
      verificationId,
      expectedAmount: targetAmount,
      walletAddress,
      ticker: GOV_TOKEN_TICKER
    });

    // Start verification process in the background
    (async () => {
      let transactionCheckAttempts = 0;
      const maxAttempts = 30; // 90 seconds with 3-second intervals

      while (transactionCheckAttempts < maxAttempts) {
        try {
          const operations = await getKRC20OperationList({
            address: walletAddress,
            tick: GOV_TOKEN_TICKER
          });

          if (Array.isArray(operations)) {
            // Look for transactions after the verification started
            const matchingOperation = operations.find(operation => 
              operation.to === walletAddress && 
              operation.amt === targetAmount && 
              operation.tick === GOV_TOKEN_TICKER &&
              new Date(operation.timestamp).getTime() > timestamp
            );

            if (matchingOperation) {
              logger.info({ 
                proposalId,
                hashRev: matchingOperation.hashRev,
                amount: matchingOperation.amt,
                tick: matchingOperation.tick 
              }, 'Found matching transaction, creating nomination');
              
              const nomination = await createProposalNomination({
                proposal_id: proposalId,
                toaddress: walletAddress,
                amountsent: new Decimal(fee.toString()),
                hash: matchingOperation.hashRev,
                created: new Date(),
                validvote: true
              });
              
              logger.info({ nominationId: nomination.id, proposalId }, 'Nomination created successfully');
              return;
            }
          }

          transactionCheckAttempts++;
          logger.debug({ 
            attempt: transactionCheckAttempts, 
            maxAttempts, 
            proposalId 
          }, 'Transaction not found, continuing to check');

          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          logger.error({ error, proposalId }, 'Error during transaction check');
          return;
        }
      }

      logger.warn({ proposalId }, 'Transaction verification timed out');
    })();

  } catch (error) {
    logger.error({ error, proposalId: req.body.proposalId }, 'Error initiating verification process');
    next(error);
  }
};

export const getNominationVerificationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    const { verificationId } = req.query;

    if (isNaN(proposalId)) {
      logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    if (!verificationId || typeof verificationId !== 'string') {
      logger.warn({ proposalId, verificationId }, 'Missing or invalid verificationId parameter');
      res.status(400).json({ error: 'Missing or invalid verificationId parameter' });
      return;
    }

    // Decode the verification ID to get the target amount and timestamp
    const [encodedProposalId, encodedAmount, timestamp] = Buffer.from(verificationId, 'base64')
      .toString()
      .split('-');

    if (Number(encodedProposalId) !== proposalId) {
      logger.warn({ proposalId, verificationId }, 'Verification ID does not match proposal ID');
      res.status(400).json({ error: 'Invalid verification ID' });
      return;
    }

    // Check if a nomination exists for this proposal that was created after the verification started
    const nominations = await getNominationsForProposal(proposalId);
    const nomination = nominations.find(n => {
      const createdDate = n.created ? new Date(n.created).getTime() : 0;
      return createdDate > Number(timestamp);
    });

    if (nomination) {
      logger.info({ proposalId, verificationId }, 'Nomination verification completed');
      res.status(200).json({
        status: 'completed',
        nomination,
        proposal: await getProposalById(proposalId) // Include updated proposal data
      });
    } else {
      logger.debug({ proposalId, verificationId }, 'Nomination not found, still pending');
      res.status(200).json({
        status: 'pending',
        message: 'Verification in progress'
      });
    }
  } catch (error) {
    logger.error({ error, proposalId: req.params.id }, 'Error checking nomination status');
    next(error);
  }
}; 