import { Request, Response, NextFunction } from 'express';
import { proposalNominationFee } from '../utils/tokenCalcs.js';
import { getKRC20OperationList } from '../services/kasplexAPI.js';
import { getProposalById } from '../models/Proposals.js';
import { createProposalNomination } from '../models/ProposalNominations.js';
import dotenv from 'dotenv';

dotenv.config();

const GOV_TOKEN_TICKER = process.env.GOV_TOKEN_TICKER || '';

export const getNominationFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fee = await proposalNominationFee();
    res.status(200).json({ fee });
  } catch (error) {
    next(error);
  }
};

export const verifyNominationTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fee, proposalId } = req.body;
    const proposal = await getProposalById(proposalId);

    if (!proposal || !proposal.wallet) {
      res.status(404).json({ error: 'Proposal or wallet not found' });
      return;
    }

    const walletAddress = proposal.wallet.address;
    const targetAmount = fee * 100000000;

    const checkTransaction = async (): Promise<string | null> => {
      const operations = await getKRC20OperationList({ address: walletAddress, tick: GOV_TOKEN_TICKER });
      for (const operation of operations) {
        if (operation.to === walletAddress && operation.amt === targetAmount && operation.tick === GOV_TOKEN_TICKER) {
          return operation.hashRev;
        }
      }
      return null;
    };

    const startTime = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - startTime > 90000) {
        clearInterval(interval);
        res.status(408).json({ error: 'Transaction not found within the time limit' });
        return;
      }

      const hashRev = await checkTransaction();
      if (hashRev) {
        clearInterval(interval);
        const nomination = await createProposalNomination({
          proposalId,
          hash: hashRev,
          toAddress: walletAddress,
          amountSent: fee,
          validVote: true,
        });
        res.status(201).json({ id: nomination.id, message: 'Nomination successful' });
      }
    }, 3000);
  } catch (error) {
    next(error);
  }
}; 