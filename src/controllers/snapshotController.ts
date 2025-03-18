import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import {
  getAllProposalSnapshots,
  createProposalSnapshot,
  getProposalById
} from '../models/proposalModels.js';
import {
  getAllElectionSnapshots,
  createElectionSnapshot,
  getElectionById
} from '../models/electionModels.js';
import { fetchTokenSnapshot } from '../services/snapshotService.js';
import { CreateSnapshotRequest, SnapshotData } from '../types/snapshotTypes.js';
import { prisma } from '../config/prisma.js';
import { withErrorHandling } from '../utils/errorHandler.js';

const logger = createModuleLogger('snapshotController');

// Raw handlers without try/catch blocks
const _fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all proposal snapshots');
  const snapshots = await getAllProposalSnapshots();
  logger.debug({ snapshotCount: snapshots.length }, 'Proposal snapshots retrieved successfully');
  res.status(200).json(snapshots);
};

const _fetchAllElectionSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all election snapshots');
  const snapshots = await getAllElectionSnapshots();
  logger.debug({ snapshotCount: snapshots.length }, 'Election snapshots retrieved successfully');
  res.status(200).json(snapshots);
};

const _createNewSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { entityType, entityId } = req.body as CreateSnapshotRequest;
  
  if (!entityType || !entityId) {
    logger.warn({ body: req.body }, 'Missing required fields for snapshot creation');
    res.status(400).json({ error: 'Missing required fields: entityType and entityId' });
    return;
  }

  // Validate that the entity exists
  if (entityType === 'proposal') {
    const proposal = await getProposalById(entityId);
    if (!proposal) {
      logger.warn({ proposalId: entityId }, 'Proposal not found');
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }
  } else if (entityType === 'election') {
    const election = await getElectionById(entityId);
    if (!election) {
      logger.warn({ electionId: entityId }, 'Election not found');
      res.status(404).json({ error: 'Election not found' });
      return;
    }
  } else {
    logger.warn({ entityType }, 'Invalid entity type');
    res.status(400).json({ error: 'Invalid entity type' });
    return;
  }

  // Rest of the implementation - continue with the same logic as the original function
  logger.info({ entityType, entityId }, 'Creating new token snapshot');
  const tokenSnapshot = await fetchTokenSnapshot();
  
  if (!tokenSnapshot || !tokenSnapshot.holders) {
    logger.error('Failed to fetch token snapshot');
    res.status(500).json({ error: 'Failed to fetch token snapshot' });
    return;
  }
  
  logger.info({ tokenCount: tokenSnapshot.holders.length }, 'Token snapshot created successfully');

  // Create snapshot record
  if (entityType === 'proposal') {
    await createProposalSnapshot(entityId, tokenSnapshot);
  } else if (entityType === 'election') {
    await createElectionSnapshot(entityId, tokenSnapshot);
  }

  res.status(201).json({ 
    success: true,
    message: `Snapshot created successfully for ${entityType} ID ${entityId}`,
    tokenCount: tokenSnapshot.holders.length
  });
};

const _fetchSnapshotById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const snapshotId = parseInt(req.params.id, 10);
  
  if (isNaN(snapshotId)) {
    logger.warn({ id: req.params.id }, 'Invalid snapshot ID format');
    res.status(400).json({ error: 'Invalid snapshot ID' });
    return;
  }

  logger.info({ snapshotId }, 'Fetching snapshot by ID');
  
  // Try to find in proposal snapshots first
  const proposalSnapshot = await prisma.proposal_snapshots.findUnique({
    where: { id: snapshotId }
  });

  if (proposalSnapshot) {
    logger.info({ snapshotId, type: 'proposal' }, 'Proposal snapshot retrieved successfully');
    res.status(200).json(proposalSnapshot);
    return;
  }

  // If not found, try election snapshots
  const electionSnapshot = await prisma.election_snapshots.findUnique({
    where: { id: snapshotId }
  });

  if (electionSnapshot) {
    logger.info({ snapshotId, type: 'election' }, 'Election snapshot retrieved successfully');
    res.status(200).json(electionSnapshot);
    return;
  }

  logger.warn({ snapshotId }, 'Snapshot not found');
  res.status(404).json({ error: 'Snapshot not found' });
};

// Exported handlers with error handling
export const fetchAllProposalSnapshots = withErrorHandling(_fetchAllProposalSnapshots, logger);
export const fetchAllElectionSnapshots = withErrorHandling(_fetchAllElectionSnapshots, logger);
export const createNewSnapshot = withErrorHandling(_createNewSnapshot, logger);
export const fetchSnapshotById = withErrorHandling(_fetchSnapshotById, logger);
