import { Request, Response, NextFunction } from 'express';
import { updateProposal, getProposalById } from '../models/Proposals.js';
import { proposalSubmissionFee } from '../utils/tokenCalcs.js';

export const qualifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposalId = parseInt(req.params.proposalId, 10);
    if (isNaN(proposalId)) {
      res.status(400).json({ error: 'Invalid proposal ID' });
      return;
    }

    // Update the proposal using updateProposal
    const updatedProposal = await updateProposal(proposalId, req.body);
    if (!updatedProposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    // Fetch the proposal to get the wallet address
    const proposalWithWallet = await getProposalById(proposalId);
    if (!proposalWithWallet) {
      res.status(404).json({ error: 'Proposal not found after update' });
      return;
    }

    // Calculate the proposal submission fee
    const fee = await proposalSubmissionFee();

    // Return the fee and the proposal wallet address
    res.status(200).json({
      fee,
      wallet: proposalWithWallet.wallet_address, // Fetch the wallet address from the joined result
    });
  } catch (error) {
    next(error);
  }
}; 