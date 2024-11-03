import { Router } from 'express';
import { fetchAllProposalNoVotes, submitProposalNoVote, modifyProposalNoVote, removeProposalNoVote } from '../controllers/proposalNoVotesController.js';

const router = Router();

router.get('/proposal-no-votes', fetchAllProposalNoVotes);
router.post('/proposal-no-votes', submitProposalNoVote);
router.put('/proposal-no-votes/:id', modifyProposalNoVote);
router.delete('/proposal-no-votes/:id', removeProposalNoVote);

export default router; 