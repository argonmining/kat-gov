import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import * as proposalController from '../controllers/proposalController.js';
import * as electionController from '../controllers/electionController.js';
import * as snapshotController from '../controllers/snapshotController.js';
import * as burnController from '../controllers/burnController.js';
import * as treasuryController from '../controllers/treasuryController.js';
import * as cleanupController from '../controllers/cleanupController.js';
import * as candidateController from '../controllers/candidateController.js';

const router = Router();
const logger = createModuleLogger('govRoutes');

// ============================================================================
// Middleware Configuration
// ============================================================================

// Route logging middleware
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

// Apply middleware
router.use(logRoute);

// ============================================================================
// System Routes
// ============================================================================

// Health check endpoint
router.get('/test', (req: Request, res: Response) => {
  logger.info('Test endpoint hit');
  res.status(200).json({ message: 'Gov routes are working' });
});

// System configuration endpoint
router.get('/config', proposalController.getGovConfig);

// Active item count endpoints
router.get('/active/proposal/count', proposalController.fetchActiveProposalCount);
router.get('/active/election/count', electionController.fetchActiveElectionCount);

// ============================================================================
// Proposal Management Routes
// ============================================================================

// Proposal type management
router.get('/proposal/types', proposalController.fetchAllProposalTypes);
router.post('/proposal/types', proposalController.addProposalType);
router.put('/proposal/types/:id', proposalController.modifyProposalType);
router.delete('/proposal/types/:id', proposalController.removeProposalType);

// Proposal status management
router.get('/proposal/statuses', proposalController.fetchAllProposalStatuses);
router.post('/proposal/statuses', proposalController.addProposalStatus);
router.put('/proposal/statuses/:id', proposalController.modifyProposalStatus);
router.delete('/proposal/statuses/:id', proposalController.removeProposalStatus);

// Core proposal operations
router.get('/proposals', proposalController.fetchAllProposals);
router.post('/proposal', proposalController.submitProposal);
router.get('/proposal/:id', proposalController.fetchProposalById);
router.put('/proposal/:id', proposalController.modifyProposal);

// Proposal voting management
router.get('/proposal/:id/votes', proposalController.fetchVotesForProposal);
router.get('/proposal/votes/yes', proposalController.fetchAllProposalYesVotes);
router.post('/proposal/votes/yes', proposalController.submitProposalYesVote);
router.get('/proposal/votes/no', proposalController.fetchAllProposalNoVotes);
router.post('/proposal/votes/no', proposalController.submitProposalNoVote);

// Proposal nomination management
router.get('/proposal/:id/nominations', proposalController.fetchNominationsForProposal);
router.get('/proposal/:id/nominations/count', proposalController.fetchNominationCount);
router.get('/proposal/nomination/fee', proposalController.getNominationFee);
router.post('/proposal/nomination/create', proposalController.verifyNominationTransaction);
router.get('/proposal/:id/nominations/status', proposalController.getNominationVerificationStatus);

// ============================================================================
// Election Management Routes
// ============================================================================

// Election type management
router.get('/election/types', electionController.fetchAllElectionTypes);
router.post('/election/types', electionController.addElectionType);
router.put('/election/types/:id', electionController.modifyElectionType);
router.delete('/election/types/:id', electionController.removeElectionType);

// Election status management
router.get('/election/statuses', electionController.fetchAllElectionStatuses);
router.post('/election/statuses', electionController.addElectionStatus);
router.put('/election/statuses/:id', electionController.modifyElectionStatus);
router.delete('/election/statuses/:id', electionController.removeElectionStatus);

// Election position management
router.get('/election/positions', electionController.fetchAllElectionPositions);
router.post('/election/positions', electionController.addElectionPosition);
router.put('/election/positions/:id', electionController.modifyElectionPosition);
router.delete('/election/positions/:id', electionController.removeElectionPosition);

// Election candidate management
router.get('/election/candidates', electionController.fetchAllElectionCandidates);
router.post('/election/candidates', electionController.submitElectionCandidate);
router.put('/election/candidates/:id', electionController.modifyElectionCandidate);
router.delete('/election/candidates/:id', electionController.removeElectionCandidate);

// Core election operations
router.get('/elections', electionController.fetchAllElections);
router.get('/election/:id', electionController.fetchElectionById);
router.post('/election', electionController.submitElection);
router.put('/election/:id', electionController.modifyElection);
router.delete('/election/:id', electionController.removeElection);

// ============================================================================
// Candidate Management Routes
// ============================================================================

// Candidate voting operations
router.post('/election/candidate/votes', candidateController.submitCandidateVote);
router.get('/election/candidate/:candidateId/votes', candidateController.fetchVotesForCandidate);

// Candidate wallet management
router.get('/election/candidate/wallets', candidateController.fetchAllCandidateWallets);
router.post('/election/candidate/wallets', candidateController.addCandidateWallet);
router.put('/election/candidate/wallets/:id', candidateController.modifyCandidateWallet);
router.delete('/election/candidate/wallets/:id', candidateController.removeCandidateWallet);

// Candidate nomination management
router.get('/election/candidate/nominations', candidateController.fetchAllCandidateNominations);
router.post('/election/candidate/nominations', candidateController.submitCandidateNomination);
router.put('/election/candidate/nominations/:id', candidateController.modifyCandidateNomination);
router.delete('/election/candidate/nominations/:id', candidateController.removeCandidateNomination);
router.get('/election/nomination/fee', candidateController.getCandidateNominationFee);

// ============================================================================
// Snapshot Management Routes
// ============================================================================

router.get('/proposal/snapshots', snapshotController.fetchAllProposalSnapshots);
router.get('/election/snapshots', snapshotController.fetchAllElectionSnapshots);
router.post('/snapshot', snapshotController.createNewSnapshot);

// ============================================================================
// Token Burn Management Routes
// ============================================================================

router.post('/burn/krc20', burnController.burnKrc20Tokens);
router.post('/burn/kaspa', burnController.burnKaspaTokens);
router.post('/burn/return-gov', burnController.returnGovKaspaTokens);
router.post('/burn/drop-gas', burnController.dropKasGasTokens);
router.post('/burn/yes-wallet', burnController.burnYesWalletTokens);
router.post('/burn/no-wallet', burnController.burnNoWalletTokens);

// ============================================================================
// Treasury Management Routes
// ============================================================================

router.post('/treasury/fetch-transactions', treasuryController.fetchTreasuryTransactions);
router.get('/treasury/wallets', treasuryController.getTreasuryWallets);
router.get('/treasury/wallet/:address/transactions', treasuryController.getWalletTransactions);

// ============================================================================
// System Maintenance Routes
// ============================================================================

router.post('/cleanup/draft-proposals', cleanupController.cleanupDraftProposals);

// Apply error handling middleware last
router.use(errorHandler);

export default router; 