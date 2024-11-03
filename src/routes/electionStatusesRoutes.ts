import { Router } from 'express';
import { fetchAllElectionStatuses, addElectionStatus, modifyElectionStatus, removeElectionStatus } from '../controllers/electionStatusesController.js';

const router = Router();

router.get('/election-statuses', fetchAllElectionStatuses);
router.post('/election-statuses', addElectionStatus);
router.put('/election-statuses/:id', modifyElectionStatus);
router.delete('/election-statuses/:id', removeElectionStatus);

export default router;
