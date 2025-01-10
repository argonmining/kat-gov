import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
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
  getElectionById
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

const logger = createModuleLogger('electionController');

// Elections
export const submitElection = async (req: Request, res: Response): Promise<void> => {
  try {
    const electionData = req.body;
    logger.info({ electionData }, 'Submitting election');
    
    const newElection = await createElection({
      title: electionData.title,
      description: electionData.description,
      reviewed: false,
      approved: false,
      votesactive: false,
      openvote: electionData.startDate ? new Date(electionData.startDate) : null,
      closevote: electionData.endDate ? new Date(electionData.endDate) : null,
      created: new Date(),
      type: electionData.type,
      position: electionData.position,
      firstcandidate: null,
      secondcandidate: null,
      status: 1, // Default status
      snapshot: null
    });

    // Transform to match frontend format
    const transformedElection = {
      id: newElection.id,
      title: newElection.title,
      description: newElection.description,
      startDate: newElection.openvote?.toISOString(),
      endDate: newElection.closevote?.toISOString()
    };

    logger.info({ electionId: newElection.id }, 'Election submitted successfully');
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
      secondcandidate: election.secondcandidate
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

export const submitElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const candidate: Omit<ElectionCandidate, 'id'> = req.body;
    logger.info({ candidate }, 'Submitting election candidate');
    
    // Create the candidate first
    const newCandidate = await createElectionCandidate({
      ...candidate,
      created: new Date()
    });

    // Then create a new Kaspa wallet and associate it with the candidate
    const { address, encryptedPrivateKey } = await createKaspaWallet();
    const wallet = await createCandidateWallet(address, encryptedPrivateKey, newCandidate.id);
    
    // Update the candidate with the wallet ID
    const updatedCandidate = await updateElectionCandidate(newCandidate.id, {
      wallet: wallet.id
    });

    logger.info({ candidateId: newCandidate.id, walletId: wallet.id }, 'Candidate and wallet created successfully');
    res.status(201).json(updatedCandidate);
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