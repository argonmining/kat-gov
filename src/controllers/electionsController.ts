import { Request, Response, NextFunction } from 'express';
import { createElection, getAllElections, deleteElection } from '../models/Elections.js';
import { Election } from '../types/Elections.js';
import { createCandidateNomination } from '../models/CandidateNominations.js';

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