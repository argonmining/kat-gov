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
  submitProposalSnapshot,
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

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ error: err }, 'Route error occurred');
  res.status(500).json({ error: 'Internal server error' });
};

router.use(logRoute);

// Proposal Statuses
router.get('/statuses', fetchAllProposalStatuses);
router.post('/statuses', addProposalStatus);
router.put('/statuses/:id', modifyProposalStatus);
router.delete('/statuses/:id', removeProposalStatus);

// Proposal Types
router.get('/types', fetchAllProposalTypes);
router.post('/types', addProposalType);
router.put('/types/:id', modifyProposalType);
router.delete('/types/:id', removeProposalType);

// Proposal Snapshots
router.get('/snapshots', fetchAllProposalSnapshots);
router.post('/snapshots', submitProposalSnapshot);
router.put('/snapshots/:id', modifyProposalSnapshot);
router.delete('/snapshots/:id', removeProposalSnapshot);

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

// Proposal Votes
router.post('/votes', submitProposalVote);

// Proposals
router.post('/', submitProposal);
router.get('/', fetchAllProposals);
router.get('/:id', fetchProposalById);
router.get('/:id/votes', fetchVotesForProposal);
router.put('/:id', modifyProposal);
router.delete('/:id', removeProposal);

router.use(errorHandler);

export default router; 