import { Router } from 'express';
import { validateProposal } from '../middlewares/validationMiddleware.js';
import { submitProposal, fetchAllProposals, modifyProposal, removeProposal, fetchProposalById } from '../controllers/proposalsController.js';

const router = Router();

router.post('/proposals', validateProposal, submitProposal);
router.get('/proposals', fetchAllProposals);
router.put('/proposals/:proposalId', modifyProposal);
router.delete('/proposals/:proposalId', removeProposal);
router.get('/proposals/:id', fetchProposalById);

export default router; 