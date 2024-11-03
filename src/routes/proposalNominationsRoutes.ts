import { Router } from 'express';
import { fetchAllProposalNominations, submitProposalNomination, modifyProposalNomination, removeProposalNomination } from '../controllers/proposalNominationsController.js';

const router = Router();

router.get('/proposal-nominations', fetchAllProposalNominations);
router.post('/proposal-nominations', submitProposalNomination);
router.put('/proposal-nominations/:id', modifyProposalNomination);
router.delete('/proposal-nominations/:id', removeProposalNomination);

export default router; 