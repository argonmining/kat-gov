// src/routes/electionRoutes.ts
import { Router } from 'express';
import { submitElection, fetchAllElections, nominateCandidate, removeElection } from '../controllers/electionController.js';

const router = Router();

router.post('/elections', submitElection);
router.get('/elections', fetchAllElections);
router.post('/elections/:electionId/nominate', nominateCandidate);
router.delete('/elections/:id', removeElection);

export default router;
