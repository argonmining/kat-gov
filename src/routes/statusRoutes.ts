import { Router } from 'express';
import { fetchAllStatuses, addStatus, modifyStatus, removeStatus } from '../controllers/statusController.js';

const router = Router();

router.get('/statuses', fetchAllStatuses);
router.post('/statuses', addStatus);
router.put('/statuses/:id', modifyStatus);
router.delete('/statuses/:id', removeStatus);

export default router;
