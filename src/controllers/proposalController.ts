import { Request, Response, NextFunction } from 'express';
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
  updateProposalYesVote,
  deleteProposalYesVote,
  createProposalNoVote,
  getAllProposalNoVotes,
  updateProposalNoVote,
  deleteProposalNoVote,
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
  deleteProposalStatus
} from '../models/proposalModels.js';
import {
  Proposal,
  ProposalVote,
  ProposalYesVote,
  ProposalNoVote,
  ProposalNomination,
  ProposalType,
  ProposalStatus
} from '../types/proposalTypes.js';
import { proposalSubmissionFee } from '../utils/tokenCalcs.js';
import { createKaspaWallet } from '../utils/walletUtils.js';

// Proposals
export const submitProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal: Omit<Proposal, 'id'> = req.body;

    // Generate a new wallet
    const walletDetails = await createKaspaWallet();

    // Create a new proposal wallet entry
    const proposalWalletId = await createProposalWallet(walletDetails.address, walletDetails.encryptedPrivateKey);
    console.log(`Created proposal wallet with ID: ${proposalWalletId}`);

    // Add wallet details and defaults to the proposal
    const newProposal = await createProposal({
      ...proposal,
      title: proposal.title,
      description: proposal.description,
      submitted: new Date(),
      reviewed: false,
      approved: false,
      passed: false,
      votesActive: false,
      status: 1,
      wallet: proposalWalletId.id,
    });

    console.log('Proposal created successfully:', newProposal);
    res.status(201).json({
      proposalId: newProposal.id,
      walletAddress: walletDetails.address,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      title: req.query.title as string | undefined,
      status: req.query.status ? parseInt(req.query.status as string, 10) : undefined
    };
    const sort = req.query.sort as string;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const proposals = await getAllProposals(filters, sort, limit, offset);
    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error in fetchAllProposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
};

export const modifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }
    const updatedProposal = await updateProposal(proposalId, req.body);
    if (updatedProposal) {
      res.status(200).json(updatedProposal);
    } else {
      res.status(404).json({ error: 'Proposal not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const removeProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }
    console.log('Attempting to delete proposal with ID:', proposalId);
    await deleteProposal(proposalId);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
};

export const fetchProposalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    const proposal = await getProposalById(proposalId);
    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    res.status(200).json(proposal);
  } catch (error) {
    next(error);
  }
};

// Proposal Votes
export const submitProposalVote = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received payload:', req.body);
    const vote: Omit<ProposalVote, 'id'> = req.body;
    const newVote = await createProposalVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalVote:', error);
    res.status(500).json({ error: 'Failed to submit proposal vote' });
  }
};

export const fetchVotesForProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }
    const votes = await getVotesForProposal(proposalId);
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchVotesForProposal:', error);
    res.status(500).json({ error: 'Failed to fetch votes for proposal' });
  }
};

// Proposal Yes Votes
export const fetchAllProposalYesVotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const votes = await getAllProposalYesVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchAllProposalYesVotes:', error);
    next(error);
  }
};

export const submitProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vote: Omit<ProposalYesVote, 'id' | 'created'> = req.body;
    const newVote = await createProposalYesVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalYesVote:', error);
    next(error);
  }
};

export const modifyProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const voteData: Partial<ProposalYesVote> = req.body;
    const updatedVote = await updateProposalYesVote(id, voteData);
    res.status(200).json(updatedVote);
  } catch (error) {
    console.error('Error in modifyProposalYesVote:', error);
    next(error);
  }
};

export const removeProposalYesVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalYesVote(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalYesVote:', error);
    next(error);
  }
};

// Proposal No Votes
export const fetchAllProposalNoVotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const votes = await getAllProposalNoVotes();
    res.status(200).json(votes);
  } catch (error) {
    console.error('Error in fetchAllProposalNoVotes:', error);
    next(error);
  }
};

export const submitProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vote: Omit<ProposalNoVote, 'id' | 'created'> = req.body;
    const newVote = await createProposalNoVote(vote);
    res.status(201).json(newVote);
  } catch (error) {
    console.error('Error in submitProposalNoVote:', error);
    next(error);
  }
};

export const modifyProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const voteData: Partial<ProposalNoVote> = req.body;
    const updatedVote = await updateProposalNoVote(id, voteData);
    res.status(200).json(updatedVote);
  } catch (error) {
    console.error('Error in modifyProposalNoVote:', error);
    next(error);
  }
};

export const removeProposalNoVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalNoVote(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalNoVote:', error);
    next(error);
  }
};

// Proposal Nominations
export const fetchAllProposalNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nominations = await getAllProposalNominations();
    res.status(200).json(nominations);
  } catch (error) {
    console.error('Error in fetchAllProposalNominations:', error);
    next(error);
  }
};

export const submitProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nomination: Omit<ProposalNomination, 'id'> = req.body;
    const newNomination = await createProposalNomination(nomination);
    res.status(201).json(newNomination);
  } catch (error) {
    console.error('Error in submitProposalNomination:', error);
    next(error);
  }
};

export const modifyProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const nominationData: Partial<ProposalNomination> = req.body;
    const updatedNomination = await updateProposalNomination(id, nominationData);
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error('Error in modifyProposalNomination:', error);
    next(error);
  }
};

export const removeProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalNomination(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeProposalNomination:', error);
    next(error);
  }
};

// Proposal Types
export const fetchAllProposalTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const types = await getAllProposalTypes();
    res.status(200).json(types);
  } catch (error) {
    next(error);
  }
};

export const addProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    const newType = await createProposalType(name, active);
    res.status(201).json(newType);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedType = await updateProposalType(id, name, active);
    res.status(200).json(updatedType);
  } catch (error) {
    next(error);
  }
};

export const removeProposalType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalType(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Proposal Statuses
export const fetchAllProposalStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statuses = await getAllProposalStatuses();
    res.status(200).json(statuses);
  } catch (error) {
    next(error);
  }
};

export const addProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    const newStatus = await createProposalStatus(name, active);
    res.status(201).json(newStatus);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedStatus = await updateProposalStatus(id, name, active);
    res.status(200).json(updatedStatus);
  } catch (error) {
    next(error);
  }
};

export const removeProposalStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalStatus(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Proposal Qualification
export const qualifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    const updatedProposal = await updateProposal(proposalId, req.body);
    if (!updatedProposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const proposalWithWallet = await getProposalById(proposalId);
    if (!proposalWithWallet) {
      res.status(404).json({ error: 'Proposal not found after update' });
      return;
    }

    const fee = await proposalSubmissionFee();

    res.status(200).json({
      fee,
      wallet: proposalWithWallet.wallet,
    });
  } catch (error) {
    next(error);
  }
};

// Proposal Snapshots
export const fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const snapshots = await getAllProposalSnapshots();
    res.status(200).json(snapshots);
  } catch (error) {
    next(error);
  }
};

export const addProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { proposalId, data } = req.body;
    const newSnapshot = await createProposalSnapshot(proposalId, data);
    res.status(201).json(newSnapshot);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data } = req.body;
    const updatedSnapshot = await updateProposalSnapshot(id, data);
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    next(error);
  }
};

export const removeProposalSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalSnapshot(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 