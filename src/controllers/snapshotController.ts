import { Request, Response, NextFunction } from 'express';
import { getAllProposalSnapshots, createProposalSnapshot, updateProposalSnapshot, deleteProposalSnapshot } from '../models/ProposalSnapshots.js';
import { getAllElectionSnapshots, createElectionSnapshot, updateElectionSnapshot, deleteElectionSnapshot } from '../models/ElectionSnapshots.js';

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
    const { proposalId, snapshotData } = req.body;
    const newSnapshot = await createProposalSnapshot(proposalId, snapshotData);
    res.status(201).json(newSnapshot);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { snapshotData } = req.body;
    const updatedSnapshot = await updateProposalSnapshot(id, snapshotData);
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

export const fetchAllElectionSnapshots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshots = await getAllElectionSnapshots();
    res.status(200).json(snapshots);
  } catch (error) {
    next(error);
  }
};

export const addElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { electionId, snapshotData } = req.body;
    const newSnapshot = await createElectionSnapshot(electionId, snapshotData);
    res.status(201).json(newSnapshot);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { snapshotData } = req.body;
    const updatedSnapshot = await updateElectionSnapshot(id, snapshotData);
    res.status(200).json(updatedSnapshot);
  } catch (error) {
    next(error);
  }
};

export const removeElectionSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionSnapshot(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
