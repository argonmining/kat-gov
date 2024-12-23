import { Router } from 'express';
import {
  // Proposals
  submitProposal,
  fetchAllProposals,
  fetchProposalById,
  modifyProposal,
  removeProposal,
  // Proposal Votes
  submitProposalVote,
  fetchVotesForProposal,
  // Proposal Yes Votes
  fetchAllProposalYesVotes,
  submitProposalYesVote,
  modifyProposalYesVote,
  removeProposalYesVote,
  // Proposal No Votes
  fetchAllProposalNoVotes,
  submitProposalNoVote,
  modifyProposalNoVote,
  removeProposalNoVote,
  // Proposal Nominations
  fetchAllProposalNominations,
  submitProposalNomination,
  modifyProposalNomination,
  removeProposalNomination,
  // Proposal Types
  fetchAllProposalTypes,
  addProposalType,
  modifyProposalType,
  removeProposalType,
  // Proposal Statuses
  fetchAllProposalStatuses,
  addProposalStatus,
  modifyProposalStatus,
  removeProposalStatus
} from '../controllers/proposalController.js';

const router = Router();

// Proposals
router.post('/', submitProposal);
router.get('/', fetchAllProposals);
router.get('/:id', fetchProposalById);
router.put('/:proposalId', modifyProposal);
router.delete('/:proposalId', removeProposal);

// Proposal Votes
router.post('/votes', submitProposalVote);
router.get('/:proposalId/votes', fetchVotesForProposal);

// Proposal Yes Votes
router.get('/yes-votes', fetchAllProposalYesVotes);
router.post('/yes-votes', submitProposalYesVote);
router.put('/yes-votes/:id', modifyProposalYesVote);
router.delete('/yes-votes/:id', removeProposalYesVote);

// Proposal No Votes
router.get('/no-votes', fetchAllProposalNoVotes);
router.post('/no-votes', submitProposalNoVote);
router.put('/no-votes/:id', modifyProposalNoVote);
router.delete('/no-votes/:id', removeProposalNoVote);

// Proposal Nominations
router.get('/nominations', fetchAllProposalNominations);
router.post('/nominations', submitProposalNomination);
router.put('/nominations/:id', modifyProposalNomination);
router.delete('/nominations/:id', removeProposalNomination);

// Proposal Types
router.get('/types', fetchAllProposalTypes);
router.post('/types', addProposalType);
router.put('/types/:id', modifyProposalType);
router.delete('/types/:id', removeProposalType);

// Proposal Statuses
router.get('/statuses', fetchAllProposalStatuses);
router.post('/statuses', addProposalStatus);
router.put('/statuses/:id', modifyProposalStatus);
router.delete('/statuses/:id', removeProposalStatus);

export default router; 