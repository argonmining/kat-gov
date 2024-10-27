import { Request, Response } from 'express';
import { createProposal } from '../models/Proposal';
import { Proposal } from '../types/Proposal';

export const submitProposal = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposal: Omit<Proposal, 'id'> = req.body;
        const newProposal = await createProposal(proposal);
        res.status(201).json(newProposal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit proposal' });
    }
};

