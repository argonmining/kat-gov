import { Router } from 'express';
import { submitProposalVote, fetchVotesForProposal } from '../controllers/proposalVotesController.js';

const router = Router();

router.post('/proposal-votes', submitProposalVote);
router.get('/proposal-votes/:proposalId', fetchVotesForProposal);

export default router; 