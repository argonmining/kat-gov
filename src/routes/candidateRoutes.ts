import { Router } from 'express';
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

const router = Router();

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