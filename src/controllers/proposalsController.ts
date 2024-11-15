import { Request, Response, NextFunction } from 'express';
import { createProposal, getAllProposals, updateProposal, deleteProposal, getProposalById } from '../models/Proposals.js';
import { Proposal } from '../types/Proposals.js';
import { createProposalNomination } from '../models/ProposalNominations.js';
import { createKaspaWallet } from '../utils/walletUtils.js'; // Import the wallet generation function
import { createProposalWallet } from '../models/ProposalWallet.js'; // Import the correct wallet model

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
      submitted: new Date(),
      reviewed: false,
      approved: false,
      passed: false,
      votesActive: false,
      status: 1,
      wallet: proposalWalletId, // Link the proposal to the wallet
    });

    console.log('Proposal created successfully:', newProposal); // Log success
    res.status(201).json({
      proposalId: newProposal.id,
      walletAddress: walletDetails.address,
    });
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
};

export const fetchAllProposals = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      title: req.query.title,
      status: req.query.status ? parseInt(req.query.status as string, 10) : undefined,
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
      return; // Exit the function after sending a response
    }
    const updatedProposal = await updateProposal(proposalId, req.body);
    if (updatedProposal) {
      res.status(200).json(updatedProposal);
    } else {
      res.status(404).json({ error: 'Proposal not found' });
    }
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
};

export const removeProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return; // Exit the function after sending a response
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