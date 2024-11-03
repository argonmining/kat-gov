import { Router } from 'express';
import { fetchAllProposalStatuses, addProposalStatus, modifyProposalStatus, removeProposalStatus } from '../controllers/proposalStatusesController.js';

const router = Router();

router.get('/statuses', fetchAllProposalStatuses);
router.post('/statuses', addProposalStatus);
router.put('/statuses/:id', modifyProposalStatus);
router.delete('/statuses/:id', removeProposalStatus);

export default router; 