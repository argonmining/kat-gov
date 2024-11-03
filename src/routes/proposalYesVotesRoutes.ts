import { Router } from 'express';
import { fetchAllProposalYesVotes, submitProposalYesVote, modifyProposalYesVote, removeProposalYesVote } from '../controllers/proposalYesVotesController.js';

const router = Router();

router.get('/proposal-yes-votes', fetchAllProposalYesVotes);
router.post('/proposal-yes-votes', submitProposalYesVote);
router.put('/proposal-yes-votes/:id', modifyProposalYesVote);
router.delete('/proposal-yes-votes/:id', removeProposalYesVote);

export default router; 