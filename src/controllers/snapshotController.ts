import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import {
  getAllProposalSnapshots,
  createProposalSnapshot,
  updateProposalSnapshot,
  deleteProposalSnapshot
} from '../models/proposalModels.js';
import {
  getAllElectionSnapshots,
  createElectionSnapshot,
  updateElectionSnapshot,
  deleteElectionSnapshot
} from '../models/electionModels.js';

const logger = createModuleLogger('snapshotController');

export const fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction) => {
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

export const addProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId, snapshotData } = req.body;
    logger.info({ proposalId }, 'Adding proposal snapshot');
    
    const newSnapshot = await createProposalSnapshot(proposalId, snapshotData);
    logger.info({ snapshotId: newSnapshot.id, proposalId }, 'Proposal snapshot created successfully');
    res.status(201).json(newSnapshot);
  } catch (error) {
    logger.error({ error, proposalId: req.body.proposalId }, 'Error adding proposal snapshot');
    next(error);
  }
};

export const modifyProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    const { snapshotData } = req.body;
    logger.info({ snapshotId: id }, 'Modifying proposal snapshot');
    
    const updatedSnapshot = await updateProposalSnapshot(id, snapshotData);
    logger.info({ snapshotId: id }, 'Proposal snapshot updated successfully');
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error modifying proposal snapshot');
    next(error);
  }
};

export const removeProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    logger.info({ snapshotId: id }, 'Removing proposal snapshot');
    await deleteProposalSnapshot(id);
    logger.info({ snapshotId: id }, 'Proposal snapshot deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error removing proposal snapshot');
    next(error);
  }
};

export const fetchAllElectionSnapshots = async (req: Request, res: Response, next: NextFunction) => {
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

export const addElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { electionId, snapshotData } = req.body;
    logger.info({ electionId }, 'Adding election snapshot');
    
    const newSnapshot = await createElectionSnapshot(electionId, snapshotData);
    logger.info({ snapshotId: newSnapshot.id, electionId }, 'Election snapshot created successfully');
    res.status(201).json(newSnapshot);
  } catch (error) {
    logger.error({ error, electionId: req.body.electionId }, 'Error adding election snapshot');
    next(error);
  }
};

export const modifyElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    const { snapshotData } = req.body;
    logger.info({ snapshotId: id }, 'Modifying election snapshot');
    
    const updatedSnapshot = await updateElectionSnapshot(id, snapshotData);
    logger.info({ snapshotId: id }, 'Election snapshot updated successfully');
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error modifying election snapshot');
    next(error);
  }
};

export const removeElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      logger.warn({ snapshotId: req.params.id }, 'Invalid snapshot ID format');
      res.status(400).json({ error: 'Invalid snapshot ID' });
      return;
    }

    logger.info({ snapshotId: id }, 'Removing election snapshot');
    await deleteElectionSnapshot(id);
    logger.info({ snapshotId: id }, 'Election snapshot deleted successfully');
    res.status(204).send();
  } catch (error) {
    logger.error({ error, snapshotId: req.params.id }, 'Error removing election snapshot');
    next(error);
  }
};
