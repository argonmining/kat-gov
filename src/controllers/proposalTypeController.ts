import { Request, Response, NextFunction } from 'express';
import { getAllProposalTypes, createProposalType, updateProposalType, deleteProposalType } from '../models/ProposalType.js';

export const fetchAllProposalTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposalTypes = await getAllProposalTypes();
    res.status(200).json(proposalTypes);
  } catch (error) {
    next(error);
  }
};

export const addProposalType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, simple } = req.body;
    const newProposalType = await createProposalType(name, simple);
    res.status(201).json(newProposalType);
  } catch (error) {
    next(error);
  }
};

export const modifyProposalType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, simple } = req.body;
    const updatedProposalType = await updateProposalType(id, name, simple);
    res.status(200).json(updatedProposalType);
  } catch (error) {
    next(error);
  }
};

export const removeProposalType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProposalType(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
