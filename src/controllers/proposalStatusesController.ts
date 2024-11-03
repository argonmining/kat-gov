import { Request, Response, NextFunction } from 'express';
import { getAllProposalStatuses, createProposalStatus, updateProposalStatus, deleteProposalStatus } from '../models/ProposalStatuses.js';

export const fetchAllProposalStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statuses = await getAllProposalStatuses();
    res.status(200).json(statuses);
  } catch (error) {
    next(error);
  }
};

export const addProposalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, active } = req.body;
    const newStatus = await createProposalStatus(name, active);
    res.status(201).json(newStatus);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, active } = req.body;
    const updatedStatus = await updateProposalStatus(id, name, active);
    res.status(200).json(updatedStatus);
  } catch (error) {
    next(error);
  }
};

export const removeProposalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalStatus(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 