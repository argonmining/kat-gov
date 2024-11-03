import { Request, Response, NextFunction } from 'express';
import { getAllElectionStatuses, createElectionStatus, updateElectionStatus, deleteElectionStatus } from '../models/ElectionStatuses.js';

export const fetchAllElectionStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const electionStatuses = await getAllElectionStatuses();
    res.status(200).json(electionStatuses);
  } catch (error) {
    next(error);
  }
};

export const addElectionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, active } = req.body;
    const newElectionStatus = await createElectionStatus(name, active);
    res.status(201).json(newElectionStatus);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedElectionStatus = await updateElectionStatus(id, name, active);
    res.status(200).json(updatedElectionStatus);
  } catch (error) {
    next(error);
  }
};

export const removeElectionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionStatus(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
