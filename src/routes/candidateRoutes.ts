import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import {
  // Candidate Votes
  submitCandidateVote,
  fetchVotesForCandidate,
  // Candidate Wallets
  fetchAllCandidateWallets,
  addCandidateWallet,
  modifyCandidateWallet,
  removeCandidateWallet,
  // Candidate Nominations
  fetchAllCandidateNominations,
  submitCandidateNomination,
  modifyCandidateNomination,
  removeCandidateNomination
} from '../controllers/candidateController.js';

const logger = createModuleLogger('candidateRoutes');
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

// Candidate Votes
router.post('/votes', submitCandidateVote);
router.get('/:candidateId/votes', fetchVotesForCandidate);

// Candidate Wallets
router.get('/wallets', fetchAllCandidateWallets);
router.post('/wallets', addCandidateWallet);
router.put('/wallets/:id', modifyCandidateWallet);
router.delete('/wallets/:id', removeCandidateWallet);

// Candidate Nominations
router.get('/nominations', fetchAllCandidateNominations);
router.post('/nominations', submitCandidateNomination);
router.put('/nominations/:id', modifyCandidateNomination);
router.delete('/nominations/:id', removeCandidateNomination);

export default router; 