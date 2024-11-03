import { Router } from 'express';
import { submitElectionCandidate, fetchAllElectionCandidates, modifyElectionCandidate, removeElectionCandidate } from '../controllers/electionCandidateController.js';

const router = Router();

router.post('/candidates', submitElectionCandidate);
router.get('/candidates', fetchAllElectionCandidates);
router.put('/candidates/:id', modifyElectionCandidate);
router.delete('/candidates/:id', removeElectionCandidate);

export default router; 