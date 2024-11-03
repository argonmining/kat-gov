import { Router } from 'express';
import { fetchAllCandidateNominations, submitCandidateNomination, modifyCandidateNomination, removeCandidateNomination } from '../controllers/candidateNominationsController.js';

const router = Router();

router.get('/candidate-nominations', fetchAllCandidateNominations);
router.post('/candidate-nominations', submitCandidateNomination);
router.put('/candidate-nominations/:id', modifyCandidateNomination);
router.delete('/candidate-nominations/:id', removeCandidateNomination);

export default router; 