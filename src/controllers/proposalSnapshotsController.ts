import { Request, Response, NextFunction } from 'express';
import { getAllProposalSnapshots, createProposalSnapshot, updateProposalSnapshot, deleteProposalSnapshot } from '../models/ProposalSnapshots.js';

export const fetchAllProposalSnapshots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshots = await getAllProposalSnapshots();
    res.status(200).json(snapshots);
  } catch (error) {
    next(error);
  }
};

export const addProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId, data } = req.body;
    const newSnapshot = await createProposalSnapshot(proposalId, data);
    res.status(201).json(newSnapshot);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data } = req.body;
    const updatedSnapshot = await updateProposalSnapshot(id, data);
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    next(error);
  }
};

export const removeProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalSnapshot(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 