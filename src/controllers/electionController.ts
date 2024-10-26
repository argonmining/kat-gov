// src/controllers/electionController.ts
import { Request, Response, NextFunction } from 'express';
import { createElection } from '../models/Election';
import { Election } from '../types/Election';
import { getAllElections } from '../models/Election';
import { createElectionNomination } from '../models/ElectionNomination';

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

export const nominateCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const electionId = parseInt(req.params.electionId, 10);
    const { candidateId, amount, hash } = req.body;

    if (isNaN(electionId) || isNaN(candidateId) || !amount || !hash) {
      res.status(400).json({ error: 'Invalid nomination data' });
      return;
    }

    await createElectionNomination(electionId, candidateId, amount, hash);
    res.status(201).json({ message: 'Candidate nominated successfully' });
  } catch (error) {
    next(error);
  }
};
