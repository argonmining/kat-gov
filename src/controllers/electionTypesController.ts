import { Request, Response, NextFunction } from 'express';
import { getAllElectionTypes, createElectionType, updateElectionType, deleteElectionType } from '../models/ElectionTypes.js';

export const fetchAllElectionTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const electionTypes = await getAllElectionTypes();
    res.status(200).json(electionTypes);
  } catch (error) {
    next(error);
  }
};

export const addElectionType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, active } = req.body;
    const newElectionType = await createElectionType(name, active);
    res.status(201).json(newElectionType);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedElectionType = await updateElectionType(id, name, active);
    res.status(200).json(updatedElectionType);
  } catch (error) {
    next(error);
  }
};

export const removeElectionType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionType(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
