import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { proposalNominationFee } from '../utils/tokenCalcs.js';
import { getKRC20OperationList } from '../services/kasplexAPI.js';
import { getProposalById, createProposalNomination } from '../models/proposalModels.js';
import { ProposalNomination, ProposalWallet } from '../types/proposalTypes.js';
import { Decimal } from '@prisma/client/runtime/library';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

const GOV_TOKEN_TICKER = process.env.GOV_TOKEN_TICKER || '';
const logger = createModuleLogger('nominationFeeController');

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
    logger.info({ proposalId, fee }, 'Verifying nomination transaction');

    const proposal = await getProposalById(proposalId);
    if (!proposal || !proposal.wallet) {
      logger.warn({ proposalId }, 'Proposal or wallet not found');
      res.status(404).json({ error: 'Proposal or wallet not found' });
      return;
    }

    const wallet = proposal.wallet as unknown as ProposalWallet;
    const walletAddress = wallet.address;
    const targetAmount = fee * 100000000;
    logger.debug({ walletAddress, targetAmount }, 'Checking for transaction');

    const checkTransaction = async (): Promise<string | null> => {
      const operations = await getKRC20OperationList({ address: walletAddress, tick: GOV_TOKEN_TICKER });
      for (const operation of operations) {
        if (operation.to === walletAddress && operation.amt === targetAmount && operation.tick === GOV_TOKEN_TICKER) {
          logger.debug({ hashRev: operation.hashRev }, 'Found matching transaction');
          return operation.hashRev;
        }
      }
      return null;
    };

    const startTime = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - startTime > 90000) {
        clearInterval(interval);
        logger.warn({ proposalId }, 'Transaction verification timed out');
        res.status(408).json({ error: 'Transaction not found within the time limit' });
        return;
      }

      const hashRev = await checkTransaction();
      if (hashRev) {
        clearInterval(interval);
        logger.info({ proposalId, hashRev }, 'Creating nomination record');
        
        const nomination = await createProposalNomination({
          proposal_id: proposalId,
          toaddress: walletAddress,
          amountsent: new Decimal(fee.toString()),
          hash: hashRev,
          created: new Date(),
          validvote: true
        });
        
        logger.info({ nominationId: nomination.id, proposalId }, 'Nomination created successfully');
        res.status(201).json({ id: nomination.id, message: 'Nomination successful' });
      }
    }, 3000);
  } catch (error) {
    logger.error({ error, proposalId: req.body.proposalId }, 'Error verifying nomination transaction');
    next(error);
  }
}; 