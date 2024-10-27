import { Request, Response, NextFunction } from 'express';
import { createProposal } from '../models/Proposal';
import { Proposal } from '../types/Proposal';
import { getAllProposals } from '../models/Proposal';
import { updateProposal, deleteProposal } from '../models/Proposal';
import { createProposalNomination } from '../models/ProposalNomination';

export const submitProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal: Omit<Proposal, 'id'> = req.body;
    const newProposal = await createProposal(proposal);
    console.log('Proposal created successfully:', newProposal); // Log success
    res.status(201).json(newProposal);
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
    const limit = parseInt(req.query.limit as string, 10) || 10;
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
    const success = await deleteProposal(proposalId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Proposal not found' });
    }
  } catch (error) {
    next(error); // Pass error to centralized handler
  }
};

export const nominateProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    const { amount, hash } = req.body;

    if (isNaN(proposalId) || !amount || !hash) {
      res.status(400).json({ error: 'Invalid nomination data' });
      return;
    }

    await createProposalNomination(proposalId, amount, hash);
    res.status(201).json({ message: 'Proposal nominated successfully' });
  } catch (error) {
    next(error);
  }
};
