import { Request, Response, NextFunction } from 'express';
import { createElectionCandidate, getAllElectionCandidates, updateElectionCandidate, deleteElectionCandidate } from '../models/ElectionCandidate.js';
import { ElectionCandidate } from '../types/ElectionCandidate.js';

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