// src/routes/electionRoutes.ts
import { Router } from 'express';
import { submitElection, fetchAllElections, nominateCandidate } from '../controllers/electionController';

const router = Router();

router.post('/elections', submitElection);
router.get('/elections', fetchAllElections);
router.post('/elections/:electionId/nominate', nominateCandidate);

export default router;
