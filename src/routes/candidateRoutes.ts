// src/routes/candidateRoutes.ts
import { Router } from 'express';
import { submitCandidate, fetchAllCandidates } from '../controllers/candidateController.js';

const router = Router();

router.post('/candidates', submitCandidate);
router.get('/candidates', fetchAllCandidates);

export default router;

