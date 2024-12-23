import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
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
  removeProposalStatus,
  // Proposal Snapshots
  fetchAllProposalSnapshots,
  addProposalSnapshot,
  modifyProposalSnapshot,
  removeProposalSnapshot
} from '../controllers/proposalController.js';

const logger = createModuleLogger('proposalRoutes');
const router = Router();

// Middleware to log route access
const logRoute = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
  }, 'Route accessed');
  next();
};

router.use(logRoute);

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

// Proposal Snapshots
router.get('/snapshots', fetchAllProposalSnapshots);
router.post('/snapshots', addProposalSnapshot);
router.put('/snapshots/:id', modifyProposalSnapshot);
router.delete('/snapshots/:id', removeProposalSnapshot);

export default router; 