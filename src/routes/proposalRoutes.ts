import { Router } from 'express';
import { validateProposal } from '../middlewares/validationMiddleware.js';
import { submitProposal, fetchAllProposals, modifyProposal, removeProposal, nominateProposal } from '../controllers/proposalController.js';

const router = Router();

router.post('/proposals', validateProposal, submitProposal);
router.get('/proposals', fetchAllProposals);
router.put('/proposals/:proposalId', modifyProposal); // Add validation
router.delete('/proposals/:proposalId', removeProposal); // Add delete route
router.post('/proposals/:proposalId/nominate', nominateProposal);

export default router;
