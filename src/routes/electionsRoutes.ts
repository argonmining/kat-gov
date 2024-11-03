import { Router } from 'express';
import { submitElection, fetchAllElections, removeElection } from '../controllers/electionsController.js';

const router = Router();

router.post('/elections', submitElection);
router.get('/elections', fetchAllElections);
router.delete('/elections/:id', removeElection);

export default router; 