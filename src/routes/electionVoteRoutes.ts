// src/routes/electionVoteRoutes.ts
import { Router } from 'express';
import { submitElectionVote, fetchVotesForElection } from '../controllers/electionVoteController';

const router = Router();

router.post('/election-votes', submitElectionVote);
router.get('/election-votes/:electionId', fetchVotesForElection);

export default router;
