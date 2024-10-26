import { Router } from 'express';
import { validateProposal } from '../middlewares/validationMiddleware';
import { submitProposal, fetchAllProposals, modifyProposal, removeProposal, nominateProposal } from '../controllers/proposalController';

const router = Router();

router.post('/proposals', validateProposal, submitProposal);
router.get('/proposals', fetchAllProposals);
router.put('/proposals/:proposalId', validateProposal, modifyProposal); // Add validation
router.delete('/proposals/:proposalId', validateProposal, removeProposal); // Add validation
router.post('/proposals/:proposalId/nominate', nominateProposal);

export default router;
