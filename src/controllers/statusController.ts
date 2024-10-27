import { Request, Response, NextFunction } from 'express';
import { getAllStatuses, createStatus, updateStatus, deleteStatus } from '../models/Status';

export const fetchAllStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = await getAllStatuses();
    res.status(200).json(statuses);
  } catch (error) {
    next(error);
  }
};

export const addStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, active } = req.body;
    const newStatus = await createStatus(name, active);
    res.status(201).json(newStatus);
  } catch (error) {
    next(error);
  }
};

export const modifyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedStatus = await updateStatus(id, name, active);
    res.status(200).json(updatedStatus);
  } catch (error) {
    next(error);
  }
};

export const removeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteStatus(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
