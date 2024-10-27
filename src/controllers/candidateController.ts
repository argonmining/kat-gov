// src/controllers/candidateController.ts
import { Request, Response } from 'express';
import { createCandidate } from '../models/Candidate';
import { Candidate } from '../types/Candidate';
import { getAllCandidates } from '../models/Candidate';

export const submitCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate: Omit<Candidate, 'id'> = req.body;
    const newCandidate = await createCandidate(candidate);
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error('Error in submitCandidate:', error);
    res.status(500).json({ error: 'Failed to submit candidate' });
  }
};

export const fetchAllCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await getAllCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error in fetchAllCandidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};
