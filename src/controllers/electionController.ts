import { Request, Response, NextFunction } from 'express';
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
  deleteElectionType
} from '../models/electionModels.js';
import {
  Election,
  ElectionCandidate,
  ElectionPosition,
  ElectionStatus,
  ElectionType
} from '../types/electionTypes.js';

// Elections
export const submitElection = async (req: Request, res: Response): Promise<void> => {
  try {
    const election: Omit<Election, 'id'> = req.body;
    const newElection = await createElection(election);
    res.status(201).json(newElection);
  } catch (error) {
    console.error('Error in submitElection:', error);
    res.status(500).json({ error: 'Failed to submit election' });
  }
};

export const fetchAllElections = async (req: Request, res: Response): Promise<void> => {
  try {
    const elections = await getAllElections();
    res.status(200).json(elections);
  } catch (error) {
    console.error('Error in fetchAllElections:', error);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

export const removeElection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionId = parseInt(req.params.id, 10);
    await deleteElection(electionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Election Candidates
export const fetchAllElectionCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const candidates = await getAllElectionCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error in fetchAllElectionCandidates:', error);
    next(error);
  }
};

export const submitElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const candidate: Omit<ElectionCandidate, 'id'> = req.body;
    const newCandidate = await createElectionCandidate(candidate);
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error('Error in submitElectionCandidate:', error);
    next(error);
  }
};

export const modifyElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const candidateData: Partial<ElectionCandidate> = req.body;
    const updatedCandidate = await updateElectionCandidate(id, candidateData);
    res.status(200).json(updatedCandidate);
  } catch (error) {
    console.error('Error in modifyElectionCandidate:', error);
    next(error);
  }
};

export const removeElectionCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionCandidate(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeElectionCandidate:', error);
    next(error);
  }
};

// Election Positions
export const fetchAllElectionPositions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const positions = await getAllElectionPositions();
    res.status(200).json(positions);
  } catch (error) {
    next(error);
  }
};

export const addElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description } = req.body;
    const newPosition = await createElectionPosition(title, description);
    res.status(201).json(newPosition);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description } = req.body;
    const updatedPosition = await updateElectionPosition(id, title, description);
    res.status(200).json(updatedPosition);
  } catch (error) {
    next(error);
  }
};

export const removeElectionPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionPosition(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Election Statuses
export const fetchAllElectionStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionStatuses = await getAllElectionStatuses();
    res.status(200).json(electionStatuses);
  } catch (error) {
    next(error);
  }
};

export const addElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    const newElectionStatus = await createElectionStatus(name, active);
    res.status(201).json(newElectionStatus);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedElectionStatus = await updateElectionStatus(id, name, active);
    res.status(200).json(updatedElectionStatus);
  } catch (error) {
    next(error);
  }
};

export const removeElectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionStatus(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Election Types
export const fetchAllElectionTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionTypes = await getAllElectionTypes();
    res.status(200).json(electionTypes);
  } catch (error) {
    next(error);
  }
};

export const addElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, active } = req.body;
    const newElectionType = await createElectionType(name, active);
    res.status(201).json(newElectionType);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedElectionType = await updateElectionType(id, name, active);
    res.status(200).json(updatedElectionType);
  } catch (error) {
    next(error);
  }
};

export const removeElectionType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionType(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 