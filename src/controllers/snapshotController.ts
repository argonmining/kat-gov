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
import { CreateSnapshotRequest } from '../types/snapshotTypes.js';

const logger = createModuleLogger('snapshotController');

export const fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all proposal snapshots');
    const snapshots = await getAllProposalSnapshots();
    logger.debug({ snapshotCount: snapshots.length }, 'Proposal snapshots retrieved successfully');
    res.status(200).json(snapshots);
  } catch (error) {
    logger.error({ error }, 'Error fetching proposal snapshots');
    next(error);
  }
};

export const fetchAllElectionSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Fetching all election snapshots');
    const snapshots = await getAllElectionSnapshots();
    logger.debug({ snapshotCount: snapshots.length }, 'Election snapshots retrieved successfully');
    res.status(200).json(snapshots);
  } catch (error) {
    logger.error({ error }, 'Error fetching election snapshots');
    next(error);
  }
};

export const createNewSnapshot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    logger.info({ entityType, entityId }, 'Creating new snapshot');
    
    // Fetch the snapshot data from Kasplex
    const snapshotData = await fetchTokenSnapshot();
    
    // Create the snapshot in our database based on entity type
    let snapshot;
    if (entityType === 'proposal') {
      snapshot = await createProposalSnapshot(entityId, snapshotData);
    } else {
      snapshot = await createElectionSnapshot(entityId, snapshotData);
    }

    logger.info({ 
      entityType, 
      entityId, 
      snapshotId: snapshot.id,
      timestamp: snapshotData.timestamp,
      holdersCount: snapshotData.holders.length
    }, 'Snapshot created successfully');

    res.status(201).json(snapshot);
  } catch (error) {
    logger.error({ error, body: req.body }, 'Error creating snapshot');
    next(error);
  }
};
