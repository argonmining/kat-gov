// src/routes/proposalVoteRoutes.ts
import { Router } from 'express';
import { submitProposalVote, fetchVotesForProposal } from '../controllers/proposalVoteController';

const router = Router();

router.post('/proposal-votes', submitProposalVote);
router.get('/proposal-votes/:proposalId', fetchVotesForProposal);

export default router;
