import { Router } from 'express';
import { submitCandidateVote, fetchVotesForCandidate } from '../controllers/candidateVoteController.js';

const router = Router();

router.post('/election-votes', submitCandidateVote);
router.get('/election-votes/:candidateId', fetchVotesForCandidate);

export default router; 