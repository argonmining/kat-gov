import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config/prisma.js';
import {
  createElection,
  getAllElections,
  deleteElection,
  createElectionCandidate,
  getAllElectionCandidates,
  updateElectionCandidate,
  deleteElectionCandidate,
  getAllElectionPositions,
  createElectionPosition,
  updateElectionPosition,
  deleteElectionPosition,
  getAllElectionStatuses,
  createElectionStatus,
  updateElectionStatus,
  deleteElectionStatus,
  getAllElectionTypes,
  createElectionType,
  updateElectionType,
  deleteElectionType,
  countActiveElections,
  updateElection,
  getElectionById,
  getAllElectionPrimaries,
  createElectionPrimary,
  getElectionCandidatesByElectionId
} from '../models/electionModels.js';
import {
  Election,
  ElectionCandidate,
  ElectionPosition,
  ElectionStatus,
  ElectionType,
  CandidateVote
} from '../types/electionTypes.js';
import { createKaspaWallet } from '../utils/walletUtils.js';
import { createCandidateWallet } from '../models/candidateModels.js';
import { verifyTransaction, verifyTransactionByHash, convertToChainAmount } from '../utils/transactionVerificationUtils.js';
import { config } from '../config/env.js';
import { calculateVoteWeight } from '../utils/voteCalculator.js';

const logger = createModuleLogger('electionController');

// Elections
export const submitElection = async (req: Request, res: Response): Promise<void> => {
  try {
    const electionData = req.body;
    logger.info({ electionData }, 'Submitting election');
    
    // Create the parent election first
    const newElection = await createElection({
      title: electionData.title,
      description: electionData.description,
      reviewed: false,
      approved: false,
      votesactive: false,
      openvote: null, // Will be set in the primary election
      closevote: null, // Will be set in the primary election
      created: new Date(),
      type: electionData.type,
      position: electionData.position,
      firstcandidate: null,
      secondcandidate: null,
      status: 1, // Default status (draft)
      snapshot: null
    });

    // Now create the primary election automatically
    const primaryElection = await createElectionPrimary(newElection.id);

    // Update the primary with dates if provided
    if (electionData.startDate || electionData.endDate) {
      await prisma.election_primaries.update({
        where: { id: primaryElection.id },
        data: {
          openvote: electionData.startDate ? new Date(electionData.startDate) : null,
          closevote: electionData.endDate ? new Date(electionData.endDate) : null
        }
      });
    }

    // Transform to match frontend format
    const transformedElection = {
      id: newElection.id,
      title: newElection.title,
      description: newElection.description,
      primaryId: primaryElection.id,
      startDate: electionData.startDate || null,
      endDate: electionData.endDate || null,
      isPrimary: true
    };

    logger.info({ electionId: newElection.id, primaryId: primaryElection.id }, 'Election and Primary created successfully');
    res.status(201).json(transformedElection);
  } catch (error) {
    logger.error({ error, election: req.body }, 'Error submitting election');
    res.status(500).json({ error: 'Failed to submit election' });
  }
};

export const fetchAllElections = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all elections');
    const elections = await getAllElections();

    // Transform to match frontend format with complete data
    const transformedElections = elections.map(election => ({
      id: election.id,
      title: election.title || '',
      description: election.description || '',
      type: election.type,
      position: election.position,
      status: election.status,
      reviewed: election.reviewed,
      approved: election.approved,
      votesactive: election.votesactive,
      openvote: election.openvote?.toISOString(),
      closevote: election.closevote?.toISOString(),
      firstcandidate: election.firstcandidate,
      secondcandidate: election.secondcandidate,
      created: election.created?.toISOString(),
    }));

    logger.debug({ electionCount: elections.length }, 'Elections retrieved successfully');
    res.status(200).json(transformedElections);
  } catch (error) {
    logger.error({ error }, 'Error fetching elections');
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

export const removeElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionId = parseInt(req.params.id, 10);
    if (isNaN(electionId)) {
      logger.warn({ electionId: req.params.id }, 'Invalid election ID format');
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }

    logger.info({ electionId }, 'Removing election');
    await deleteElection(electionId);
    logger.info({ electionId }, 'Election deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, electionId: req.params.id }, 'Error removing election');
    next(error);
  }
};

// Election Candidates
export const fetchAllElectionCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all election candidates');
    const candidates = await getAllElectionCandidates();
    logger.debug({ candidateCount: candidates.length }, 'Candidates retrieved successfully');
    res.status(200).json(candidates);
  } catch (error) {
    logger.error({ error }, 'Error fetching election candidates');
    next(error);
  }
};

export const fetchElectionCandidatesByElectionId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionId = parseInt(req.params.id, 10);
    
    if (isNaN(electionId)) {
      logger.warn({ electionId: req.params.electionId }, 'Invalid election ID format');
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }

    logger.info({ electionId }, 'Fetching candidates for election');
    const candidates = await getElectionCandidatesByElectionId(electionId);

    // Transform candidates to include wallet information
    const transformedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name || '',
      twitter: candidate.twitter || '',
      discord: candidate.discord || '',
      telegram: candidate.telegram || '',
      created: candidate.created,
      type: candidate.type,
      status: candidate.status,
      wallet: candidate.wallet,
      nominations: candidate.nominations,
      walletAddress: candidate.candidate_wallets_candidate_wallets_candidate_idToelection_candidates?.[0]?.address || null,
      votes: candidate.candidate_votes || []
    }));

    logger.debug({ 
      electionId,
      candidateCount: candidates.length 
    }, 'Election candidates retrieved successfully');
    
    res.status(200).json(transformedCandidates);
  } catch (error) {
    logger.error({ error, electionId: req.params.electionId }, 'Error fetching election candidates');
    next(error);
  }
};

export const submitElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, twitter, discord, telegram,  data, status, type } = req.body;
    logger.info({ name, description, twitter, discord, telegram,  data, status, type }, 'Submitting election candidate');
    
    // Verify the transaction before proceeding
    if (!data?.address || !data?.expectedAmount) {
      logger.warn({ data }, 'Missing required fields');
      res.status(400).json({ error: 'Transaction details and verification details are required' });
      return;
    }

    // Convert expectedAmount to chain format
    const chainAmount = convertToChainAmount(data.expectedAmount.toString());
    logger.info({ chainAmount }, 'Chain amount');
    const verificationResult = await verifyTransaction(data.address, chainAmount);
    if (!verificationResult.isValid) {
      logger.warn({ verificationResult }, 'Transaction verification failed');
      res.status(400).json({ error: verificationResult.error || 'Transaction verification failed' });
      return;
    }

    // Create a nomination record first
    const nomination = await prisma.candidate_nominations.create({
      data: {
        amountsent: new Decimal(chainAmount),
        validvote: true,
        created: new Date().toISOString(),
        hash: verificationResult.hash,
        toaddress: data.address
      }
    });

    logger.info({ nomination }, 'nomination');

    // Create the candidate with the nomination ID
    const newCandidate = await createElectionCandidate({
      name,
      twitter: twitter || null,
      discord: discord || null,
      telegram: telegram || null,
      created: new Date(),
      data: Buffer.from(JSON.stringify({
        ...data,
        expectedAmount: chainAmount, // Store the chain format amount
        transactionHash: verificationResult.hash // Store the transaction hash in the data
      })),
      type: type || 1,
      status: status || 1,
      wallet: null, // Will be updated after wallet creation
      nominations: nomination.id // Link to the nomination record
    });

    // Update the nomination with the candidate ID
    await prisma.candidate_nominations.update({
      where: { id: nomination.id },
      data: {
        candidate_id: newCandidate.id
      }
    });

   
      logger.info({ primaryId: data.primaryId }, 'Primary ID');
      logger.info({ newCandidate }, 'newCandidate');
      await prisma.$executeRaw`
        INSERT INTO "__election_candidatesToelection_primaries" ("A", "B")
        VALUES (${newCandidate.id}, ${data.primaryId})
      `;
      logger.info('Candidate connected to primary');
   

    // Then create a new Kaspa wallet and associate it with the candidate
    const { address: walletAddress, encryptedPrivateKey } = await createKaspaWallet();
    const wallet = await createCandidateWallet(walletAddress, encryptedPrivateKey, newCandidate.id);
    
    // Update the candidate with the wallet ID
    const updatedCandidate = await updateElectionCandidate(newCandidate.id, {
      wallet: wallet.id
    });

    logger.info({ candidateId: newCandidate.id }, 'Election candidate created successfully');
    res.status(201).json({
      ...updatedCandidate,
      address: data.address,
      expectedAmount: chainAmount
    });
  } catch (error) {
    logger.error({ error, candidate: req.body }, 'Error submitting election candidate');
    next(error);
  }
};

export const modifyElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ candidateId: req.params.id }, 'Invalid candidate ID format');
      res.status(400).json({ error: 'Invalid candidate ID' });
      return;
    }

    const candidateData: Partial<ElectionCandidate> = req.body;
    logger.info({ candidateId: id, updates: candidateData }, 'Modifying election candidate');
    
    const updatedCandidate = await updateElectionCandidate(id, candidateData);
    logger.info({ candidateId: id }, 'Candidate updated successfully');
    res.status(200).json(updatedCandidate);
  } catch (error) {
    logger.error({ error, candidateId: req.params.id }, 'Error modifying election candidate');
    next(error);
  }
};

export const removeElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ candidateId: req.params.id }, 'Invalid candidate ID format');
      res.status(400).json({ error: 'Invalid candidate ID' });
      return;
    }

    logger.info({ candidateId: id }, 'Removing election candidate');
    await deleteElectionCandidate(id);
    logger.info({ candidateId: id }, 'Candidate deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, candidateId: req.params.id }, 'Error removing election candidate');
    next(error);
  }
};

// Election Positions
export const fetchAllElectionPositions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all election positions');
    const positions = await getAllElectionPositions();
    logger.debug({ positionCount: positions.length }, 'Positions retrieved successfully');
    res.status(200).json(positions);
  } catch (error) {
    logger.error({ error }, 'Error fetching election positions');
    next(error);
  }
};

export const addElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description } = req.body;
    logger.info({ title }, 'Adding election position');
    
    const newPosition = await createElectionPosition(title, description);
    logger.info({ positionId: newPosition.id }, 'Position created successfully');
    res.status(201).json(newPosition);
  } catch (error) {
    logger.error({ error, position: req.body }, 'Error adding election position');
    next(error);
  }
};

export const modifyElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ positionId: req.params.id }, 'Invalid position ID format');
      res.status(400).json({ error: 'Invalid position ID' });
      return;
    }

    const { title, description } = req.body;
    logger.info({ positionId: id, title }, 'Modifying election position');
    
    const updatedPosition = await updateElectionPosition(id, title, description);
    logger.info({ positionId: id }, 'Position updated successfully');
    res.status(200).json(updatedPosition);
  } catch (error) {
    logger.error({ error, positionId: req.params.id }, 'Error modifying election position');
    next(error);
  }
};

export const removeElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ positionId: req.params.id }, 'Invalid position ID format');
      res.status(400).json({ error: 'Invalid position ID' });
      return;
    }

    logger.info({ positionId: id }, 'Removing election position');
    await deleteElectionPosition(id);
    logger.info({ positionId: id }, 'Position deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, positionId: req.params.id }, 'Error removing election position');
    next(error);
  }
};

// Election Statuses
export const fetchAllElectionStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all election statuses');
    const electionStatuses = await getAllElectionStatuses();
    logger.debug({ statusCount: electionStatuses.length }, 'Statuses retrieved successfully');
    res.status(200).json(electionStatuses);
  } catch (error) {
    logger.error({ error }, 'Error fetching election statuses');
    next(error);
  }
};

export const addElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    logger.info({ name, active }, 'Adding election status');
    
    const newElectionStatus = await createElectionStatus(name, active);
    logger.info({ statusId: newElectionStatus.id }, 'Status created successfully');
    res.status(201).json(newElectionStatus);
  } catch (error) {
    logger.error({ error, status: req.body }, 'Error adding election status');
    next(error);
  }
};

export const modifyElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
      res.status(400).json({ error: 'Invalid status ID' });
      return;
    }

    const { name, active } = req.body;
    logger.info({ statusId: id, name, active }, 'Modifying election status');
    
    const updatedElectionStatus = await updateElectionStatus(id, name, active);
    logger.info({ statusId: id }, 'Status updated successfully');
    res.status(200).json(updatedElectionStatus);
  } catch (error) {
    logger.error({ error, statusId: req.params.id }, 'Error modifying election status');
    next(error);
  }
};

export const removeElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
      res.status(400).json({ error: 'Invalid status ID' });
      return;
    }

    logger.info({ statusId: id }, 'Removing election status');
    await deleteElectionStatus(id);
    logger.info({ statusId: id }, 'Status deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, statusId: req.params.id }, 'Error removing election status');
    next(error);
  }
};

// Election Types
export const fetchAllElectionTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all election types');
    const electionTypes = await getAllElectionTypes();
    logger.debug({ typeCount: electionTypes.length }, 'Types retrieved successfully');
    res.status(200).json(electionTypes);
  } catch (error) {
    logger.error({ error }, 'Error fetching election types');
    next(error);
  }
};

export const addElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    logger.info({ name, active }, 'Adding election type');
    
    const newElectionType = await createElectionType(name, active);
    logger.info({ typeId: newElectionType.id }, 'Type created successfully');
    res.status(201).json(newElectionType);
  } catch (error) {
    logger.error({ error, type: req.body }, 'Error adding election type');
    next(error);
  }
};

export const modifyElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    const { name, active } = req.body;
    logger.info({ typeId: id, name, active }, 'Modifying election type');
    
    const updatedElectionType = await updateElectionType(id, name, active);
    logger.info({ typeId: id }, 'Type updated successfully');
    res.status(200).json(updatedElectionType);
  } catch (error) {
    logger.error({ error, typeId: req.params.id }, 'Error modifying election type');
    next(error);
  }
};

export const removeElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    logger.info({ typeId: id }, 'Removing election type');
    await deleteElectionType(id);
    logger.info({ typeId: id }, 'Election type deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, typeId: req.params.id }, 'Error removing election type');
    next(error);
  }
};

export const submitElectionVote = undefined;
export const fetchAllElectionVotes = undefined;

export const fetchActiveElectionCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching active election count');
    const count = await countActiveElections();
    logger.debug({ count }, 'Active election count retrieved successfully');
    res.status(200).json(count);
  } catch (error) {
    logger.error({ error }, 'Error fetching active election count');
    next(error);
  }
};

export const modifyElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ electionId: req.params.id }, 'Invalid election ID format');
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }

    const electionData = req.body;
    logger.info({ electionId: id, updates: electionData }, 'Modifying election');
    
    // Convert date strings to Date objects if they exist
    if (electionData.openvote) {
      electionData.openvote = new Date(electionData.openvote);
    }
    if (electionData.closevote) {
      electionData.closevote = new Date(electionData.closevote);
    }

    // Validate candidates if they're being updated
    if (electionData.firstcandidate !== undefined || electionData.secondcandidate !== undefined) {
      // Validate first candidate if provided
      if (electionData.firstcandidate !== null && electionData.firstcandidate !== undefined) {
        const firstCandidateId = parseInt(electionData.firstcandidate, 10);
        if (isNaN(firstCandidateId)) {
          logger.warn({ candidateId: electionData.firstcandidate }, 'Invalid first candidate ID format');
          res.status(400).json({ error: 'Invalid first candidate ID format' });
          return;
        }
        
        // Check if candidate exists
        const firstCandidate = await prisma.election_candidates.findUnique({
          where: { id: firstCandidateId }
        });
        
        if (!firstCandidate) {
          logger.warn({ candidateId: firstCandidateId }, 'First candidate not found');
          res.status(404).json({ error: 'First candidate not found' });
          return;
        }
        
        electionData.firstcandidate = firstCandidateId;
      }

      // Validate second candidate if provided
      if (electionData.secondcandidate !== null && electionData.secondcandidate !== undefined) {
        const secondCandidateId = parseInt(electionData.secondcandidate, 10);
        if (isNaN(secondCandidateId)) {
          logger.warn({ candidateId: electionData.secondcandidate }, 'Invalid second candidate ID format');
          res.status(400).json({ error: 'Invalid second candidate ID format' });
          return;
        }
        
        // Check if candidate exists
        const secondCandidate = await prisma.election_candidates.findUnique({
          where: { id: secondCandidateId }
        });
        
        if (!secondCandidate) {
          logger.warn({ candidateId: secondCandidateId }, 'Second candidate not found');
          res.status(404).json({ error: 'Second candidate not found' });
          return;
        }
        
        electionData.secondcandidate = secondCandidateId;
      }
      
      // Prevent assigning the same candidate to both positions
      if (electionData.firstcandidate !== null && 
          electionData.secondcandidate !== null && 
          electionData.firstcandidate === electionData.secondcandidate) {
        logger.warn({ candidateId: electionData.firstcandidate }, 'Cannot assign the same candidate to both positions');
        res.status(400).json({ error: 'Cannot assign the same candidate to both positions' });
        return;
      }
    }

    const updatedElection = await updateElection(id, electionData);
    if (!updatedElection) {
      logger.warn({ electionId: id }, 'Election not found');
      res.status(404).json({ error: 'Election not found' });
      return;
    }

    logger.info({ electionId: id }, 'Election updated successfully');
    res.status(200).json(updatedElection);
  } catch (error) {
    logger.error({ error, electionId: req.params.id }, 'Error modifying election');
    next(error);
  }
};

// Get election by ID
export const fetchElectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }

    logger.info({ id }, 'Fetching election by ID');
    const election = await getElectionById(id);

    if (!election) {
      res.status(404).json({ error: 'Election not found' });
      return;
    }

    res.status(200).json(election);
  } catch (error) {
    logger.error({ error }, 'Error fetching election by ID');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Election Primaries
export const fetchAllElectionPrimaries = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all election primaries');
    const primaries = await getAllElectionPrimaries();

    // Transform to match frontend format with complete data
    const transformedPrimaries = primaries.map(primary => ({
      id: primary.id,
      title: primary.title || '',
      description: primary.description || '',
      type: primary.type,
      position: primary.position,
      status: primary.status,
      reviewed: primary.reviewed,
      approved: primary.approved,
      votesactive: primary.votesactive,
      openvote: primary.openvote?.toISOString(),
      closevote: primary.closevote?.toISOString(),
      created: primary.created?.toISOString(),
      candidates_count: primary.candidate_count || 0  
    }));

    logger.debug({ primaryCount: primaries.length }, 'Election primaries retrieved successfully');
    res.status(200).json(transformedPrimaries);
  } catch (error) {
    logger.error({ error }, 'Error fetching election primaries');
    res.status(500).json({ error: 'Failed to fetch election primaries' });
  }
};

/**
 * @deprecated This function is no longer used by the frontend (kat-gov-web).
 * See routes/govRoutes.ts for more information on deprecated routes.
 */
export const createElectionPrimaryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { electionId } = req.params;
    
    if (!electionId) {
      res.status(400).json({ error: 'Election ID is required' });
      return;
    }

    const primary = await createElectionPrimary(Number(electionId));
    logger.info({ electionId }, 'Successfully created primary for election');
    
    res.status(201).json(primary);
  } catch (error: any) {
    logger.error({ error, electionId: req.params.electionId }, 'Error creating election primary');
    res.status(500).json({ 
      error: error.message || 'Failed to create election primary' 
    });
  }
};

export const fetchElectionPrimaryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    logger.info({ id }, 'Fetching primary election by ID');

    // Get the election and check if it's a primary
    const primary = await prisma.election_primaries.findFirst({
      where: {
        election_id: id
      },
      include: {
        election: {
          include: {
            election_types: true,
            election_positions: true,
            election_statuses: true
          }
        },
        primary_candidates: {
          include: {
            candidate_votes: true,
            candidate_wallets_candidate_wallets_candidate_idToelection_candidates: true,
            candidate_wallets_election_candidates_walletTocandidate_wallets: true
          }
        }
      }
    });

    if (!primary) {
      res.status(404).json({ error: 'Primary election not found' });
      return;
    }

    res.status(200).json(primary);
  } catch (error) {
    logger.error({ error }, 'Error fetching primary election by ID');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @deprecated This function is no longer used by the frontend (kat-gov-web).
 * See routes/govRoutes.ts for more information on deprecated routes.
 */
export const assignCandidatesToElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionId = parseInt(req.params.id, 10);
    if (isNaN(electionId)) {
      logger.warn({ electionId: req.params.id }, 'Invalid election ID format');
      res.status(400).json({ error: 'Invalid election ID' });
      return;
    }

    // Validate the request body
    const { firstCandidateId, secondCandidateId } = req.body;
    
    if (firstCandidateId === undefined && secondCandidateId === undefined) {
      logger.warn('No candidate IDs provided for assignment');
      res.status(400).json({ error: 'At least one candidate ID must be provided' });
      return;
    }
    
    // First check if the election exists
    const existingElection = await prisma.elections.findUnique({
      where: { id: electionId }
    });
    
    if (!existingElection) {
      logger.warn({ electionId }, 'Election not found');
      res.status(404).json({ error: 'Election not found' });
      return;
    }
    
    // Prepare the update data
    const updateData: any = {};
    
    // Process first candidate if provided
    if (firstCandidateId !== undefined) {
      if (firstCandidateId === null) {
        // Allowing null to remove the candidate
        updateData.firstcandidate = null;
      } else {
        const parsedFirstId = parseInt(firstCandidateId, 10);
        if (isNaN(parsedFirstId)) {
          logger.warn({ candidateId: firstCandidateId }, 'Invalid first candidate ID format');
          res.status(400).json({ error: 'Invalid first candidate ID format' });
          return;
        }
        
        // Verify candidate exists
        const firstCandidate = await prisma.election_candidates.findUnique({
          where: { id: parsedFirstId }
        });
        
        if (!firstCandidate) {
          logger.warn({ candidateId: parsedFirstId }, 'First candidate not found');
          res.status(404).json({ error: 'First candidate not found' });
          return;
        }
        
        updateData.firstcandidate = parsedFirstId;
      }
    }
    
    // Process second candidate if provided
    if (secondCandidateId !== undefined) {
      if (secondCandidateId === null) {
        // Allowing null to remove the candidate
        updateData.secondcandidate = null;
      } else {
        const parsedSecondId = parseInt(secondCandidateId, 10);
        if (isNaN(parsedSecondId)) {
          logger.warn({ candidateId: secondCandidateId }, 'Invalid second candidate ID format');
          res.status(400).json({ error: 'Invalid second candidate ID format' });
          return;
        }
        
        // Verify candidate exists
        const secondCandidate = await prisma.election_candidates.findUnique({
          where: { id: parsedSecondId }
        });
        
        if (!secondCandidate) {
          logger.warn({ candidateId: parsedSecondId }, 'Second candidate not found');
          res.status(404).json({ error: 'Second candidate not found' });
          return;
        }
        
        updateData.secondcandidate = parsedSecondId;
      }
    }
    
    // Prevent assigning the same candidate to both positions
    if (updateData.firstcandidate !== null && updateData.secondcandidate !== null) {
      const firstId = updateData.firstcandidate ?? existingElection.firstcandidate;
      const secondId = updateData.secondcandidate ?? existingElection.secondcandidate;
      
      if (firstId !== null && secondId !== null && firstId === secondId) {
        logger.warn({ candidateId: firstId }, 'Cannot assign the same candidate to both positions');
        res.status(400).json({ error: 'Cannot assign the same candidate to both positions' });
        return;
      }
    }

    // Update the election with the new candidate assignments
    const updatedElection = await updateElection(electionId, updateData);
    
    if (!updatedElection) {
      logger.warn({ electionId }, 'Failed to update election with candidates');
      res.status(500).json({ error: 'Failed to update election with candidates' });
      return;
    }

    logger.info({ 
      electionId, 
      firstCandidateId: updateData.firstcandidate, 
      secondCandidateId: updateData.secondcandidate 
    }, 'Successfully assigned candidates to election');
    
    res.status(200).json(updatedElection);
  } catch (error) {
    logger.error({ error, electionId: req.params.id }, 'Error assigning candidates to election');
    next(error);
  }
};

/**
 * @deprecated This function is no longer used by the frontend (kat-gov-web).
 * See routes/govRoutes.ts for more information on deprecated routes.
 */
export const nominateCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { primaryId, candidateId, hash, toaddress, amountsent } = req.body;
    
    if (!primaryId || !candidateId) {
      logger.warn({ primaryId, candidateId }, 'Missing primary ID or candidate ID');
      res.status(400).json({ error: 'Primary ID and candidate ID are required' });
      return;
    }

    // Verify primary election exists
    const primary = await prisma.election_primaries.findUnique({
      where: { id: parseInt(primaryId, 10) }
    });

    if (!primary) {
      logger.warn({ primaryId }, 'Primary election not found');
      res.status(404).json({ error: 'Primary election not found' });
      return;
    }

    // Verify candidate exists
    const candidate = await prisma.election_candidates.findUnique({
      where: { id: parseInt(candidateId, 10) }
    });

    if (!candidate) {
      logger.warn({ candidateId }, 'Candidate not found');
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Create the nomination
    const nomination = await prisma.candidate_nominations.create({
      data: {
        created: new Date(),
        hash: hash,
        toaddress: toaddress,
        amountsent: new Decimal(amountsent.toString()),
        validvote: true,
        candidate_id: parseInt(candidateId, 10)
      }
    });

    // Connect candidate to primary if not already connected
    // First check if the candidate is already in the primary
    const candidateInPrimary = await prisma.election_primaries.findFirst({
      where: {
        id: parseInt(primaryId, 10),
        primary_candidates: {
          some: {
            id: parseInt(candidateId, 10)
          }
        }
      }
    });

    if (!candidateInPrimary) {
      // Connect the candidate to the primary
      await prisma.election_primaries.update({
        where: { id: parseInt(primaryId, 10) },
        data: {
          primary_candidates: {
            connect: [{ id: parseInt(candidateId, 10) }]
          }
        }
      });

      logger.info({ primaryId, candidateId }, 'Candidate connected to primary election');
    }

    // Update the candidate with the nomination
    await prisma.election_candidates.update({
      where: { id: parseInt(candidateId, 10) },
      data: {
        nominations: nomination.id
      }
    });

    logger.info({ nominationId: nomination.id, primaryId, candidateId }, 'Candidate nomination recorded successfully');
    res.status(201).json(nomination);
  } catch (error) {
    logger.error({ error, primaryId: req.body.primaryId, candidateId: req.body.candidateId }, 'Error nominating candidate');
    res.status(500).json({ error: 'Failed to nominate candidate' });
  }
};

// Add endpoint for candidate voting
export const voteForCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { election_id, candidate_id, hash, toaddress, amountsent } = req.body;
    const electionId = election_id;
    const candidateId = candidate_id;
    
    logger.info({ electionId, candidateId, hash, toaddress, amountsent }, 'Vote for candidate');

    if (!electionId || !candidateId) {
      logger.warn({ electionId, candidateId }, 'Missing election ID or candidate ID');
      res.status(400).json({ error: 'Election ID and candidate ID are required' });
      return;
    }

    let votescounted;

    // Verify the transaction
    const verificationResult = await verifyTransactionByHash(toaddress, hash);
    if (!verificationResult.isValid) {
      logger.warn({ verificationResult }, 'Transaction verification failed');
      res.status(400).json({ error: verificationResult.error || 'Transaction verification failed' });
      return;
    }

    // Check if this address has already voted using raw SQL query
    const existingVoteResult = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM candidate_votes 
      WHERE fromaddress = ${verificationResult.address} 
      AND election_snapshot_id = ${parseInt(electionId, 10)}
    `;

    const exists = existingVoteResult[0].count > 0;

    logger.info({ exists, count: existingVoteResult[0].count }, 'Existing vote result');

    if (exists) {
      logger.warn({ fromaddress: verificationResult.address, candidateId }, 'Address has already voted for this candidate');
      votescounted = null;
    } else {
      logger.info({ fromaddress: verificationResult.address, candidateId }, 'No existing vote found, proceeding with vote');
      // Calculate vote weight and ensure we get the votes property
      const voteWeight = calculateVoteWeight(amountsent, true);
      votescounted = voteWeight ? Number(voteWeight.votes) : null;
    }
    

    logger.info({ votescounted }, 'Vote counted');

    // Continue with vote process regardless of existence
    logger.info({ verificationResult }, 'Transaction verified successfully');

    // Check if the vote is for a primary or general election
    let isPrimary = false;
    let primaryId: number | null = null;
    let generalId: number | null = null;

    // First, check if the electionId is a primary election
    const primaryElection = await prisma.election_primaries.findUnique({
      where: { id: parseInt(electionId, 10) },
      include: {
        election: true
      }
    });
    
    if (primaryElection) {
      isPrimary = true;
      primaryId = primaryElection.id;
      generalId = primaryElection.election_id;
    } else {
      // Check if it's a general election
      const generalElection = await prisma.elections.findUnique({
        where: { id: parseInt(electionId, 10) },
        include: {
          primary: true
        }
      });

      if (!generalElection) {
        logger.warn({ electionId }, 'Election not found');
        res.status(404).json({ error: 'Election not found' });
        return;
      }
      
      generalId = generalElection.id;
      
      if (generalElection.primary) {
        primaryId = generalElection.primary.id;
      }
    }

    // Verify the candidate exists
    const candidate = await prisma.election_candidates.findUnique({
      where: { id: parseInt(candidateId, 10) }
    });

    if (!candidate) {
      logger.warn({ candidateId }, 'Candidate not found');
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Create a new vote
    const baseVoteData = {
      created: new Date(),
      hash: hash,
      toaddress,
      amountsent: new Decimal(amountsent.toString()),
      votescounted: votescounted,
      validvote: true,
      fromaddress: verificationResult.address,
      candidate_id: parseInt(candidateId, 10)
    };

    let vote;

    if (isPrimary) {
      // For primary elections, use candidate_votes table with raw SQL
      const result = await prisma.$queryRaw<Array<{
        id: number;
        created: Date;
        hash: string;
        toaddress: string;
        fromaddress: string;
        amountsent: Decimal;
        votescounted: number | null;
        validvote: boolean;
        candidate_id: number;
        election_snapshot_id: number;
      }>>`
        INSERT INTO candidate_votes (
          created,
          hash,
          toaddress,
          fromaddress,
          amountsent,
          votescounted,
          validvote,
          candidate_id,
          election_snapshot_id
        ) VALUES (
          ${baseVoteData.created},
          ${baseVoteData.hash},
          ${baseVoteData.toaddress},
          ${baseVoteData.fromaddress},
          ${baseVoteData.amountsent},
          ${baseVoteData.votescounted},
          ${baseVoteData.validvote},
          ${baseVoteData.candidate_id},
          ${primaryId}
        ) RETURNING *
      `;
      
      vote = result[0];
      logger.info({ voteId: vote.id, primaryId, candidateId }, 'Primary election vote recorded successfully');
    } else {
      // For general elections, use election_votes table with raw SQL
      const result = await prisma.$queryRaw<Array<{
        id: number;
        created: Date;
        toaddress: string;
        fromaddress: string;
        amountsent: Decimal;
        validvote: boolean;
        election_id: number;
        candidate_id: number;
        votescounted: number;
      }>>`
        INSERT INTO election_votes (
          created,
          toaddress,
          fromaddress,
          amountsent,
          validvote,
          election_id,
          candidate_id,
          votescounted
        ) VALUES (
          ${new Date()},
          ${toaddress},
          ${verificationResult.address},
          ${new Decimal(amountsent.toString())},
          true,
          ${generalId},
          ${parseInt(candidateId, 10)},
          ${votescounted}
        ) RETURNING *
      `;
      
      vote = result[0];
      logger.info({ voteId: vote.id, generalId, candidateId }, 'General election vote recorded successfully');
    }

    res.status(201).json(vote);
  } catch (error) {
    logger.error({ error, electionId: req.body.electionId, candidateId: req.body.candidateId }, 'Error recording vote');
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

/**
 * @deprecated This function is no longer used by the frontend (kat-gov-web).
 * See routes/govRoutes.ts for more information on deprecated routes.
 */
export const fetchElectionsWithPrimaries = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all elections with primaries');
    
    const elections = await prisma.elections.findMany({
      include: {
        election_types: true,
        election_positions: true,
        election_statuses: true,
        election_candidates_elections_firstcandidateToelection_candidates: true,
        election_candidates_elections_secondcandidateToelection_candidates: true,
        primary: {
          include: {
            election_types: true,
            election_positions: true,
            election_statuses: true,
            primary_candidates: true
          }
        }
      }
    });

    const transformedElections = elections.map(election => ({
      id: election.id,
      title: election.title || '',
      description: election.description || '',
      reviewed: election.reviewed || false,
      approved: election.approved || false,
      votesactive: election.votesactive || false,
      openvote: election.openvote?.toISOString() || null,
      closevote: election.closevote?.toISOString() || null,
      created: election.created?.toISOString() || null,
      type: election.type || null,
      typeName: election.election_types?.name || null,
      position: election.position || null,
      positionName: election.election_positions?.title || null,
      status: election.status || null,
      statusName: election.election_statuses?.name || null,
      firstcandidate: election.firstcandidate,
      firstcandidateName: election.election_candidates_elections_firstcandidateToelection_candidates?.name || null,
      secondcandidate: election.secondcandidate,
      secondcandidateName: election.election_candidates_elections_secondcandidateToelection_candidates?.name || null,
      primary: election.primary ? {
        id: election.primary.id,
        title: election.primary.title || '',
        description: election.primary.description || '',
        reviewed: election.primary.reviewed || false,
        approved: election.primary.approved || false,
        votesactive: election.primary.votesactive || false,
        openvote: election.primary.openvote?.toISOString() || null,
        closevote: election.primary.closevote?.toISOString() || null,
        status: election.primary.status,
        statusName: election.primary.election_statuses?.name || null,
        candidateCount: election.primary.primary_candidates?.length || 0
      } : null,
      isPrimary: false,
      hasActivePrimary: election.primary?.votesactive || false
    }));

    logger.debug({ electionCount: elections.length }, 'Elections with primaries retrieved successfully');
    res.status(200).json(transformedElections);
  } catch (error) {
    logger.error({ error }, 'Error fetching elections with primaries');
    res.status(500).json({ error: 'Failed to fetch elections with primaries' });
  }
};

// Add endpoint to fetch candidates for a primary election
export const fetchPrimaryCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const primaryId = parseInt(req.params.id, 10);
    
    if (isNaN(primaryId)) {
      logger.warn({ primaryId: req.params.id }, 'Invalid primary ID format');
      res.status(400).json({ error: 'Invalid primary ID' });
      return;
    }
    
    logger.info({ primaryId }, 'Fetching candidates for primary election');
    
    const primary = await prisma.election_primaries.findUnique({
      where: { id: primaryId },
      include: {
        primary_candidates: {
          include: {
            candidate_votes: true,
            candidate_wallets_election_candidates_walletTocandidate_wallets: true
          }
        }
      }
    });
    
    if (!primary) {
      logger.warn({ primaryId }, 'Primary election not found');
      res.status(404).json({ error: 'Primary election not found' });
      return;
    }
    
    const transformedCandidates = primary.primary_candidates.map(candidate => {
      // Calculate vote total
      const voteTotal = candidate.candidate_votes.reduce((sum, vote) => {
        if (vote.validvote) {
          return sum + (vote.votescounted || 0);
        }
        return sum;
      }, 0);
      
      return {
        id: candidate.id,
        name: candidate.name || '',
        twitter: candidate.twitter || '',
        discord: candidate.discord || '',
        telegram: candidate.telegram || '',
        created: candidate.created?.toISOString() || null,
        walletAddress: candidate.candidate_wallets_election_candidates_walletTocandidate_wallets?.address || null,
        voteCount: voteTotal
      };
    });
    
    logger.debug({ primaryId, candidateCount: transformedCandidates.length }, 'Primary election candidates retrieved successfully');
    res.status(200).json(transformedCandidates);
  } catch (error) {
    logger.error({ error, primaryId: req.params.id }, 'Error fetching primary election candidates');
    res.status(500).json({ error: 'Failed to fetch primary election candidates' });
  }
}; 