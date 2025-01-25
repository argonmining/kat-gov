import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createCandidateVote,
  getVotesForCandidate,
  getAllCandidateWallets,
  createCandidateWallet,
  updateCandidateWallet,
  deleteCandidateWallet,
  getAllCandidateNominations,
  createCandidateNomination,
  updateCandidateNomination,
  deleteCandidateNomination,
  createPrimaryCandidate,
  verifyPrimaryCandidateTransaction,
  getPrimaryCandidateVerification,
  verificationStore
} from '../models/candidateModels.js';
import {
  CandidateVote,
  CandidateNomination,
  CandidateWallet,
  CandidateNominationFeeResponse
} from '../types/candidateTypes.js';
import { config } from '../config/env.js';
import { candidateNominationFee } from '../utils/tokenCalcs.js';
import { PrismaClient } from '@prisma/client';
import { createKaspaWallet } from '../utils/walletUtils.js';

const logger = createModuleLogger('candidateController');
const prisma = new PrismaClient();

// Nomination Fee
export const getCandidateNominationFee = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching candidate nomination fee');
    const fee = await candidateNominationFee();
    logger.debug({ fee }, 'Nomination fee calculated successfully');
    res.status(200).json({ fee });
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate nomination fee');
    res.status(500).json({ error: 'Failed to fetch nomination fee' });
  }
};

// Candidate Votes
export const submitCandidateVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { candidate_id, toaddress, amountsent, hash } = req.body;
    if (!candidate_id || !toaddress || !amountsent) {
      logger.warn({ body: req.body }, 'Missing required fields for candidate vote');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    logger.info({ candidate_id, toaddress, amountsent }, 'Submitting candidate vote');
    
    const newVote = await createCandidateVote({
      candidate_id,
      toaddress,
      amountsent: new Decimal(amountsent.toString()),
      hash,
      created: new Date(),
      votescounted: null,
      validvote: true,
      election_snapshot_id: null
    });

    logger.info({ voteId: newVote.id }, 'Candidate vote submitted successfully');
    res.status(201).json(newVote);
  } catch (error) {
    logger.error({ error, vote: req.body }, 'Error submitting candidate vote');
    next(error);
  }
};

export const fetchVotesForCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = parseInt(req.params.candidateId, 10);
    if (isNaN(candidateId)) {
      logger.warn({ candidateId: req.params.candidateId }, 'Invalid candidate ID format');
      res.status(400).json({ error: 'Invalid candidate ID' });
      return;
    }

    logger.info({ candidateId }, 'Fetching votes for candidate');
    const votes = await getVotesForCandidate(candidateId);
    logger.debug({ candidateId, voteCount: votes.length }, 'Votes retrieved successfully');
    res.status(200).json(votes);
  } catch (error) {
    logger.error({ error, candidateId: req.params.candidateId }, 'Error fetching votes for candidate');
    res.status(500).json({ error: 'Failed to fetch votes for candidate' });
  }
};

// Candidate Wallets
export const fetchAllCandidateWallets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all candidate wallets');
    const wallets = await getAllCandidateWallets();
    logger.debug({ walletCount: wallets.length }, 'Wallets retrieved successfully');
    res.status(200).json(wallets);
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate wallets');
    next(error);
  }
};

export const addCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, encryptedPrivateKey, candidate_id } = req.body;
    if (!candidate_id) {
      logger.warn({ body: req.body }, 'Missing required candidate_id field');
      res.status(400).json({ error: 'Missing required candidate_id field' });
      return;
    }
    
    logger.info({ address, candidate_id }, 'Adding candidate wallet');
    
    const newWallet = await createCandidateWallet(address, encryptedPrivateKey, candidate_id);
    logger.info({ walletId: newWallet.id }, 'Wallet created successfully');
    res.status(201).json(newWallet);
  } catch (error) {
    logger.error({ error, address: req.body.address }, 'Error adding candidate wallet');
    next(error);
  }
};

export const modifyCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ walletId: req.params.id }, 'Invalid wallet ID format');
      res.status(400).json({ error: 'Invalid wallet ID' });
      return;
    }

    const { address, encryptedPrivateKey } = req.body;
    logger.info({ walletId: id, address }, 'Modifying candidate wallet');
    
    const updatedWallet = await updateCandidateWallet(id, address, encryptedPrivateKey);
    logger.info({ walletId: id }, 'Wallet updated successfully');
    res.status(200).json(updatedWallet);
  } catch (error) {
    logger.error({ error, walletId: req.params.id }, 'Error modifying candidate wallet');
    next(error);
  }
};

export const removeCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ walletId: req.params.id }, 'Invalid wallet ID format');
      res.status(400).json({ error: 'Invalid wallet ID' });
      return;
    }

    logger.info({ walletId: id }, 'Removing candidate wallet');
    await deleteCandidateWallet(id);
    logger.info({ walletId: id }, 'Wallet deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, walletId: req.params.id }, 'Error removing candidate wallet');
    next(error);
  }
};

// Candidate Nominations
export const fetchAllCandidateNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all candidate nominations');
    const nominations = await getAllCandidateNominations();
    logger.debug({ nominationCount: nominations.length }, 'Nominations retrieved successfully');
    res.status(200).json(nominations);
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate nominations');
    next(error);
  }
};

export const submitCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const nomination: Omit<CandidateNomination, 'id' | 'nominatedAt'> = req.body;
    logger.info({ nomination }, 'Submitting candidate nomination');
    
    const newNomination = await createCandidateNomination(nomination);
    logger.info({ nominationId: newNomination.id }, 'Nomination submitted successfully');
    res.status(201).json(newNomination);
  } catch (error) {
    logger.error({ error, nomination: req.body }, 'Error submitting candidate nomination');
    next(error);
  }
};

export const modifyCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
      res.status(400).json({ error: 'Invalid nomination ID' });
      return;
    }

    const nominationData: Partial<CandidateNomination> = req.body;
    logger.info({ nominationId: id, updates: nominationData }, 'Modifying candidate nomination');
    
    const updatedNomination = await updateCandidateNomination(id, nominationData);
    logger.info({ nominationId: id }, 'Nomination updated successfully');
    res.status(200).json(updatedNomination);
  } catch (error) {
    logger.error({ error, nominationId: req.params.id }, 'Error modifying candidate nomination');
    next(error);
  }
};

export const removeCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
      res.status(400).json({ error: 'Invalid nomination ID' });
      return;
    }

    logger.info({ nominationId: id }, 'Removing candidate nomination');
    await deleteCandidateNomination(id);
    logger.info({ nominationId: id }, 'Nomination deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, nominationId: req.params.id }, 'Error removing candidate nomination');
    next(error);
  }
};

// Primary Candidate Submission
export const submitPrimaryCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, twitter, discord, telegram, primaryId, verificationId } = req.body;
    
    if (!name || !description || !primaryId || !verificationId) {
      logger.warn({ body: req.body }, 'Missing required fields for primary candidate submission');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    logger.info({ primaryId, name, verificationId }, 'Submitting primary candidate');

    // Get verification data from store
    const verificationData = verificationStore.get(verificationId);
    if (!verificationData) {
      logger.warn({ verificationId }, 'Verification data not found');
      res.status(400).json({ error: 'Invalid or expired verification ID' });
      return;
    }

    if (verificationData.status !== 'completed') {
      logger.warn({ verificationId, status: verificationData.status }, 'Payment not verified');
      res.status(400).json({ error: 'Payment not verified' });
      return;
    }

    // Create the candidate with the verified wallet
    const candidate = await createPrimaryCandidate({
      name,
      description,
      twitter: twitter || null,
      discord: discord || null,
      telegram: telegram || null,
      type: 1, // Primary candidate type
      status: 1, // Active status
      primaryId,
      verificationId,
      walletAddress: verificationData.walletAddress
    });

    logger.debug({ candidate }, 'Primary candidate created successfully');
    res.status(201).json(candidate);
  } catch (error) {
    logger.error({ error }, 'Error submitting primary candidate');
    res.status(500).json({ error: 'Failed to submit primary candidate' });
  }
};

// Verify Primary Candidate Submission
export const verifyPrimaryCandidateSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fee, primaryId, name, description, twitter, discord, telegram } = req.body;
    
    if (!fee || !primaryId || !name) {
      logger.warn({ body: req.body }, 'Missing required fields for primary candidate verification');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    logger.info({ primaryId, fee, name }, 'Creating and verifying primary candidate submission');

    // Create a pending candidate record first
    const candidate = await prisma.election_candidates.create({
      data: {
        name,
        twitter: twitter ?? null,
        discord: discord ?? null,
        telegram: telegram ?? null,
        type: 1, // Pending type
        status: 1, // Pending status
        created: new Date(),
        candidates_of_primaries: {
          connect: {
            id: primaryId
          }
        }
      }
    });
    
    const verificationResult = await verifyPrimaryCandidateTransaction({
      fee,
      primaryId,
      candidateId: candidate.id
    });

    logger.debug({ verificationResult }, 'Primary candidate verification initiated');
    res.status(200).json(verificationResult);
  } catch (error) {
    logger.error({ error }, 'Error verifying primary candidate submission');
    res.status(500).json({ error: 'Failed to verify primary candidate submission' });
  }
};

// Get Primary Candidate Verification Status
export const getPrimaryCandidateVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { primaryId, verificationId } = req.params;
    
    if (!primaryId || !verificationId) {
      logger.warn({ params: req.params }, 'Missing required parameters for verification status check');
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    logger.info({ primaryId, verificationId }, 'Checking primary candidate verification status');
    
    const status = await getPrimaryCandidateVerification(Number(primaryId), verificationId);

    logger.debug({ status }, 'Primary candidate verification status retrieved');
    res.status(200).json(status);
  } catch (error) {
    logger.error({ error }, 'Error checking primary candidate verification status');
    res.status(500).json({ error: 'Failed to check verification status' });
  }
};

export const generateCandidateWallet = async (req: Request, res: Response) => {
  try {
    // Use existing createKaspaWallet function
    const { address, encryptedPrivateKey } = await createKaspaWallet();

    // Create wallet record in database
    const wallet = await prisma.candidate_wallets.create({
      data: {
        address,
        encryptedprivatekey: encryptedPrivateKey,
        balance: 0,
        created: new Date(),
        active: true
      }
    });

    // Generate a verification ID for tracking this submission
    const verificationId = crypto.randomUUID();

    // Return the address and verification ID
    res.status(200).json({
      address: wallet.address,
      verificationId
    });
  } catch (error) {
    logger.error({ error }, 'Error generating candidate wallet');
    res.status(500).json({ error: 'Failed to generate wallet' });
  }
}; 