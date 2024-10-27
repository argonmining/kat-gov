import { Request, Response, NextFunction } from 'express';
import { getAllPositions, createPosition, updatePosition, deletePosition } from '../models/Position';

export const fetchAllPositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const positions = await getAllPositions();
    res.status(200).json(positions);
  } catch (error) {
    next(error);
  }
};

export const addPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, filled, elect } = req.body;
    const newPosition = await createPosition(title, filled, elect);
    res.status(201).json(newPosition);
  } catch (error) {
    next(error);
  }
};

export const modifyPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, filled, elect } = req.body;
    const updatedPosition = await updatePosition(id, title, filled, elect);
    res.status(200).json(updatedPosition);
  } catch (error) {
    next(error);
  }
};

export const removePosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deletePosition(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
