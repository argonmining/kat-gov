import { Request, Response, NextFunction } from 'express';
import { getAllElectionPositions, createElectionPosition, updateElectionPosition, deleteElectionPosition } from '../models/ElectionPositions.js';

export const fetchAllElectionPositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const positions = await getAllElectionPositions();
    res.status(200).json(positions);
  } catch (error) {
    next(error);
  }
};

export const addElectionPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const newPosition = await createElectionPosition(title, description);
    res.status(201).json(newPosition);
  } catch (error) {
    next(error);
  }
};

export const modifyElectionPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description } = req.body;
    const updatedPosition = await updateElectionPosition(id, title, description);
    res.status(200).json(updatedPosition);
  } catch (error) {
    next(error);
  }
};

export const removeElectionPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteElectionPosition(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 