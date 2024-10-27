import { Router } from 'express';
import { fetchAllProposalTypes, addProposalType, modifyProposalType, removeProposalType } from '../controllers/proposalTypeController';

const router = Router();

router.get('/proposal-types', fetchAllProposalTypes);
router.post('/proposal-types', addProposalType);
router.put('/proposal-types/:id', modifyProposalType);
router.delete('/proposal-types/:id', removeProposalType);

export default router;
