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
import { config, GOV_TOKEN_TICKER } from '../config/env.js';
import { candidateNominationFee } from '../utils/tokenCalcs.js';
import { PrismaClient } from '@prisma/client';
import { createKaspaWallet } from '../utils/walletUtils.js';
import { withErrorHandling, withDirectErrorHandling } from '../utils/errorHandler.js';

const logger = createModuleLogger('candidateController');
const prisma = new PrismaClient();

// Define a custom verification store for our controller
// This matches the model's verification store structure
type VerificationRecord = {
  candidateId: number;
  electionId: number;
  timestamp: number;
  verified: boolean;
};

// We'll use our own verification store to track the state between requests
const candidateVerificationStore = new Map<string, VerificationRecord>();

// Raw handlers without try/catch blocks
// ==================================================================================

// Nomination Fee
const _getCandidateNominationFee = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching candidate nomination fee');
  const fee = await candidateNominationFee();
  logger.debug({ fee }, 'Nomination fee calculated successfully');
  res.status(200).json({ fee });
};

// Candidate Votes
const _submitCandidateVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
};

const _fetchVotesForCandidate = async (req: Request, res: Response): Promise<void> => {
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
};

// Candidate Wallets
const _fetchAllCandidateWallets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all candidate wallets');
  const wallets = await getAllCandidateWallets();
  logger.debug({ walletCount: wallets.length }, 'Candidate wallets retrieved successfully');
  res.status(200).json(wallets);
};

const _addCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { address, encryptedprivatekey, candidate_id } = req.body;
  if (!address || !encryptedprivatekey) {
    logger.warn({ body: req.body }, 'Missing required fields for candidate wallet');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ address, candidate_id }, 'Adding candidate wallet');
  
  // Match the function signature required by the model
  const wallet = await createCandidateWallet(address, encryptedprivatekey, candidate_id || null);

  logger.info({ walletId: wallet.id }, 'Candidate wallet added successfully');
  res.status(201).json(wallet);
};

const _modifyCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const walletId = parseInt(req.params.id, 10);
  if (isNaN(walletId)) {
    logger.warn({ walletId: req.params.id }, 'Invalid wallet ID format');
    res.status(400).json({ error: 'Invalid wallet ID' });
    return;
  }

  const { address, encryptedprivatekey } = req.body;
  if (!address || !encryptedprivatekey) {
    logger.warn({ body: req.body }, 'Missing required fields for wallet update');
    res.status(400).json({ error: 'Address and encrypted private key are required' });
    return;
  }

  logger.info({ walletId, updates: req.body }, 'Modifying candidate wallet');

  try {
    // Match the function signature required by the model
    const updatedWallet = await updateCandidateWallet(walletId, address, encryptedprivatekey);
    logger.info({ walletId }, 'Candidate wallet updated successfully');
    res.status(200).json(updatedWallet);
  } catch (error) {
    logger.warn({ walletId, error }, 'Wallet not found or update failed');
    res.status(404).json({ error: 'Wallet not found or update failed' });
  }
};

const _removeCandidateWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const walletId = parseInt(req.params.id, 10);
  if (isNaN(walletId)) {
    logger.warn({ walletId: req.params.id }, 'Invalid wallet ID format');
    res.status(400).json({ error: 'Invalid wallet ID' });
    return;
  }

  logger.info({ walletId }, 'Removing candidate wallet');
  
  try {
    // Function returns void, so we can't check return value
    await deleteCandidateWallet(walletId);
    logger.info({ walletId }, 'Candidate wallet removed successfully');
    res.status(200).json({ success: true, message: 'Wallet removed successfully' });
  } catch (error) {
    logger.warn({ walletId, error }, 'Wallet not found or delete failed');
    res.status(404).json({ error: 'Wallet not found or delete failed' });
  }
};

// Candidate Nominations
const _fetchAllCandidateNominations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all candidate nominations');
  const nominations = await getAllCandidateNominations();
  logger.debug({ nominationCount: nominations.length }, 'Candidate nominations retrieved successfully');
  res.status(200).json(nominations);
};

const _submitCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { candidate_id, toaddress, amountsent } = req.body;
  if (!candidate_id || !toaddress || !amountsent) {
    logger.warn({ body: req.body }, 'Missing required fields for candidate nomination');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ candidate_id, toaddress, amountsent }, 'Submitting candidate nomination');

  const nomination = await createCandidateNomination({
    candidate_id,
    toaddress,
    amountsent: new Decimal(amountsent.toString()),
    created: new Date()
  });

  logger.info({ nominationId: nomination.id }, 'Candidate nomination submitted successfully');
  res.status(201).json(nomination);
};

const _modifyCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const nominationId = parseInt(req.params.id, 10);
  if (isNaN(nominationId)) {
    logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
    res.status(400).json({ error: 'Invalid nomination ID' });
    return;
  }

  const { amountsent } = req.body;
  logger.info({ nominationId, amountsent }, 'Modifying candidate nomination');

  try {
    // Only amountsent can be updated per model signature
    const updatedNomination = await updateCandidateNomination(nominationId, {
      amountsent: amountsent ? new Decimal(amountsent.toString()) : undefined
    });
    
    logger.info({ nominationId }, 'Candidate nomination updated successfully');
    res.status(200).json(updatedNomination);
  } catch (error) {
    logger.warn({ nominationId, error }, 'Nomination not found or update failed');
    res.status(404).json({ error: 'Nomination not found or update failed' });
  }
};

const _removeCandidateNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const nominationId = parseInt(req.params.id, 10);
  if (isNaN(nominationId)) {
    logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
    res.status(400).json({ error: 'Invalid nomination ID' });
    return;
  }

  logger.info({ nominationId }, 'Removing candidate nomination');
  
  try {
    // Function returns void, so we can't check return value
    await deleteCandidateNomination(nominationId);
    logger.info({ nominationId }, 'Candidate nomination removed successfully');
    res.status(200).json({ success: true, message: 'Nomination removed successfully' });
  } catch (error) {
    logger.warn({ nominationId, error }, 'Nomination not found or delete failed');
    res.status(404).json({ error: 'Nomination not found or delete failed' });
  }
};

const _submitPrimaryCandidate = async (req: Request, res: Response): Promise<void> => {
  const { electionId, name, twitter, discord, telegram, description } = req.body;
  
  if (!electionId || !name) {
    logger.warn({ body: req.body }, 'Missing required fields for primary candidate');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Check if election exists and is a primary
  const election = await prisma.election_primaries.findUnique({
    where: { election_id: parseInt(electionId, 10) }
  });

  if (!election) {
    logger.warn({ electionId }, 'Primary election not found');
    res.status(404).json({ error: 'Primary election not found' });
    return;
  }

  if (!election.votesactive) {
    logger.warn({ electionId }, 'Primary election is not accepting candidates');
    res.status(400).json({ error: 'This primary is not accepting candidates at this time' });
    return;
  }

  logger.info({ electionId, name }, 'Creating primary candidate');
  
  // Generate a wallet for the candidate
  const walletData = await createKaspaWallet();
  if (!walletData || !walletData.address) {
    logger.error('Failed to generate wallet');
    res.status(500).json({ error: 'Failed to generate wallet' });
    return;
  }

  // Generate a UUID for verification
  const verificationId = crypto.randomUUID();
  
  // Create the candidate matching the model's expected signature
  const candidate = await createPrimaryCandidate({
    name,
    description: description || '',
    twitter: twitter || null,
    discord: discord || null,
    telegram: telegram || null,
    type: 1, // Primary candidate type
    status: 1, // Pending status
    primaryId: parseInt(electionId, 10),
    verificationId,
    walletAddress: walletData.address
  });

  // Get configuration details for response
  const fee = await candidateNominationFee();
  
  // Store verification details in our custom store
  candidateVerificationStore.set(verificationId, {
    candidateId: candidate.id,
    electionId: parseInt(electionId, 10),
    timestamp: Date.now(),
    verified: false
  });

  logger.info({ candidateId: candidate.id, verificationId }, 'Primary candidate created successfully');
  
  // Return response with verification details
  res.status(201).json({
    candidate,
    verification: {
      id: verificationId,
      fee,
      address: walletData.address
    }
  });
};

const _verifyPrimaryCandidateSubmission = async (req: Request, res: Response): Promise<void> => {
  const { verificationId, transactionHash } = req.body;
  
  if (!verificationId || !transactionHash) {
    logger.warn({ body: req.body }, 'Missing required fields for verification');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ verificationId, transactionHash }, 'Verifying primary candidate submission');
  
  // Check if verification ID exists in our custom store
  const verification = candidateVerificationStore.get(verificationId);
  if (!verification) {
    logger.warn({ verificationId }, 'Verification ID not found');
    res.status(404).json({ error: 'Verification ID not found or expired' });
    return;
  }

  try {
    // Call verification with model's expected signature
    const result = await verifyPrimaryCandidateTransaction({
      fee: 0, // Required by model signature but not needed
      primaryId: verification.electionId,
      candidateId: verification.candidateId
    });

    // Update our custom verification record
    verification.verified = true;
    candidateVerificationStore.set(verificationId, verification);
    
    logger.info({ 
      verificationId, 
      candidateId: verification.candidateId 
    }, 'Primary candidate verification successful');
    
    res.status(200).json({
      success: true,
      message: 'Candidate nomination verified successfully',
      candidateId: verification.candidateId
    });
  } catch (error) {
    logger.error({ error, verificationId }, 'Error during transaction verification');
    res.status(500).json({ 
      success: false,
      message: 'Error verifying transaction'
    });
  }
};

const _getPrimaryCandidateVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  const { verificationId } = req.params;
  
  if (!verificationId) {
    logger.warn({ params: req.params }, 'Missing verification ID');
    res.status(400).json({ error: 'Missing verification ID' });
    return;
  }

  logger.info({ verificationId }, 'Checking primary candidate verification status');
  
  // Check if verification ID exists in our custom store
  const verification = candidateVerificationStore.get(verificationId);
  if (!verification) {
    logger.warn({ verificationId }, 'Verification ID not found');
    res.status(404).json({ error: 'Verification ID not found or expired' });
    return;
  }

  try {
    // Get verification details using model signature  
    const status = await getPrimaryCandidateVerification(
      verification.electionId,
      verificationId
    );
    
    logger.info({ 
      verificationId, 
      verified: verification.verified,
      candidateId: verification.candidateId
    }, 'Retrieved verification status');
    
    res.status(200).json({
      verificationId,
      verified: verification.verified,
      candidateId: verification.candidateId,
      electionId: verification.electionId,
      ...status
    });
  } catch (error) {
    logger.error({ error, verificationId }, 'Error getting verification status');
    res.status(500).json({ error: 'Error checking verification status' });
  }
};

const _generateCandidateWallet = async (req: Request, res: Response): Promise<void> => {
  logger.info('Generating new candidate wallet');
  
  // Generate a new wallet
  const walletData = await createKaspaWallet();
  
  if (!walletData || !walletData.address) {
    logger.error('Failed to generate wallet');
    res.status(500).json({ error: 'Failed to generate wallet' });
    return;
  }
  
  logger.info({ address: walletData.address }, 'Candidate wallet generated successfully');
  
  res.status(201).json({
    address: walletData.address,
    encryptedPrivateKey: walletData.encryptedPrivateKey
  });
};

// Export wrapped handlers with error handling
// ==================================================================================
export const getCandidateNominationFee = withDirectErrorHandling(_getCandidateNominationFee, logger);
export const submitCandidateVote = withErrorHandling(_submitCandidateVote, logger);
export const fetchVotesForCandidate = withDirectErrorHandling(_fetchVotesForCandidate, logger);
export const fetchAllCandidateWallets = withErrorHandling(_fetchAllCandidateWallets, logger);
export const addCandidateWallet = withErrorHandling(_addCandidateWallet, logger);
export const modifyCandidateWallet = withErrorHandling(_modifyCandidateWallet, logger);
export const removeCandidateWallet = withErrorHandling(_removeCandidateWallet, logger);
export const fetchAllCandidateNominations = withErrorHandling(_fetchAllCandidateNominations, logger);
export const submitCandidateNomination = withErrorHandling(_submitCandidateNomination, logger);
export const modifyCandidateNomination = withErrorHandling(_modifyCandidateNomination, logger);
export const removeCandidateNomination = withErrorHandling(_removeCandidateNomination, logger);
export const submitPrimaryCandidate = withDirectErrorHandling(_submitPrimaryCandidate, logger);
export const verifyPrimaryCandidateSubmission = withDirectErrorHandling(_verifyPrimaryCandidateSubmission, logger);
export const getPrimaryCandidateVerificationStatus = withDirectErrorHandling(_getPrimaryCandidateVerificationStatus, logger);
export const generateCandidateWallet = withDirectErrorHandling(_generateCandidateWallet, logger); 