import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import * as proposalController from '../controllers/proposalController.js';
import * as electionController from '../controllers/electionController.js';
import * as snapshotController from '../controllers/snapshotController.js';
import * as burnController from '../controllers/burnController.js';
import * as treasuryController from '../controllers/treasuryController.js';
import * as cleanupController from '../controllers/cleanupController.js';
import * as candidateController from '../controllers/candidateController.js';
import * as schedulerController from '../controllers/schedulerController.js';

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

router.get('/test', (req: Request, res: Response) => {
  logger.info('Test endpoint hit');
  res.status(200).json({ message: 'Gov routes are working' });
});

router.get('/config', proposalController.getGovConfig);

// Active item counts
router.get('/active/proposal/count', proposalController.fetchActiveProposalCount);
router.get('/active/election/count', electionController.fetchActiveElectionCount);

// Scheduler triggers
router.post('/scheduler/run/draft-cleanup', schedulerController.runDraftCleanupHandler);
router.post('/scheduler/run/proposal-voting', schedulerController.runProposalVotingHandler);
router.post('/scheduler/run/treasury-transactions', schedulerController.runTreasuryTransactionsHandler);
router.post('/scheduler/run/election-primaries', schedulerController.runElectionPrimariesHandler);

// System maintenance
router.post('/cleanup/draft-proposals', cleanupController.cleanupDraftProposals);

// ============================================================================
// Proposal Routes
// ============================================================================

// List endpoints
router.get('/proposals', proposalController.fetchAllProposals);
router.get('/proposal/types', proposalController.fetchAllProposalTypes);
router.get('/proposal/statuses', proposalController.fetchAllProposalStatuses);
router.get('/proposal/votes/yes', proposalController.fetchAllProposalYesVotes);
router.get('/proposal/votes/no', proposalController.fetchAllProposalNoVotes);
router.get('/proposal/nomination/fee', proposalController.getNominationFee);
router.get('/proposal/edit/fee', proposalController.getEditFee);

// Create endpoints
router.post('/proposal', proposalController.submitProposal);
router.post('/proposal/types', proposalController.addProposalType);
router.post('/proposal/statuses', proposalController.addProposalStatus);
router.post('/proposal/votes/yes', proposalController.submitProposalYesVote);
router.post('/proposal/votes/no', proposalController.submitProposalNoVote);
router.post('/proposal/nomination/create', proposalController.verifyNominationTransaction);

// Parameterized endpoints
router.get('/proposal/:id', proposalController.fetchProposalById);
router.put('/proposal/:id', proposalController.modifyProposal);
router.get('/proposal/:id/votes', proposalController.fetchVotesForProposal);
router.get('/proposal/:id/nominations', proposalController.fetchNominationsForProposal);
router.get('/proposal/:id/nominations/count', proposalController.fetchNominationCount);
router.get('/proposal/:id/nominations/status', proposalController.getNominationVerificationStatus);
router.post('/proposal/:id/verify-edit', proposalController.verifyProposalEditWithExistingNomination);

// Type and status management
router.put('/proposal/types/:id', proposalController.modifyProposalType);
router.delete('/proposal/types/:id', proposalController.removeProposalType);
router.put('/proposal/statuses/:id', proposalController.modifyProposalStatus);
router.delete('/proposal/statuses/:id', proposalController.removeProposalStatus);

// ============================================================================
// Election Routes
// ============================================================================

// List endpoints
router.get('/elections', electionController.fetchAllElections);
router.get('/elections/primaries', electionController.fetchAllElectionPrimaries);
router.get('/election/types', electionController.fetchAllElectionTypes);
router.get('/election/statuses', electionController.fetchAllElectionStatuses);
router.get('/election/positions', electionController.fetchAllElectionPositions);
router.get('/election/candidates', electionController.fetchAllElectionCandidates);
router.get('/election/candidate/wallets', candidateController.fetchAllCandidateWallets);
router.get('/election/candidate/nominations', candidateController.fetchAllCandidateNominations);
router.get('/election/nomination/fee', candidateController.getCandidateNominationFee);

// Create endpoints
router.post('/election', electionController.submitElection);
router.post('/election/types', electionController.addElectionType);
router.post('/election/statuses', electionController.addElectionStatus);
router.post('/election/positions', electionController.addElectionPosition);
router.post('/election/candidates', electionController.submitElectionCandidate);
router.post('/election/candidate/wallets', candidateController.addCandidateWallet);
router.post('/election/candidate/nominations', candidateController.submitCandidateNomination);
router.post('/election/candidate/votes', candidateController.submitCandidateVote);

// Parameterized endpoints
router.post('/election/:electionId/primary', electionController.createElectionPrimaryHandler);
router.get('/election/:id/primary', electionController.fetchElectionPrimaryById);
router.get('/election/:id', electionController.fetchElectionById);
router.put('/election/:id', electionController.modifyElection);
router.delete('/election/:id', electionController.removeElection);

// Type, status, and position management
router.put('/election/types/:id', electionController.modifyElectionType);
router.delete('/election/types/:id', electionController.removeElectionType);
router.put('/election/statuses/:id', electionController.modifyElectionStatus);
router.delete('/election/statuses/:id', electionController.removeElectionStatus);
router.put('/election/positions/:id', electionController.modifyElectionPosition);
router.delete('/election/positions/:id', electionController.removeElectionPosition);

// Candidate management
router.put('/election/candidates/:id', electionController.modifyElectionCandidate);
router.delete('/election/candidates/:id', electionController.removeElectionCandidate);
router.get('/election/candidate/:candidateId/votes', candidateController.fetchVotesForCandidate);
router.put('/election/candidate/wallets/:id', candidateController.modifyCandidateWallet);
router.delete('/election/candidate/wallets/:id', candidateController.removeCandidateWallet);
router.put('/election/candidate/nominations/:id', candidateController.modifyCandidateNomination);
router.delete('/election/candidate/nominations/:id', candidateController.removeCandidateNomination);

// ============================================================================
// Snapshot Routes
// ============================================================================

router.get('/proposal/snapshots', snapshotController.fetchAllProposalSnapshots);
router.get('/election/snapshots', snapshotController.fetchAllElectionSnapshots);
router.post('/snapshot', snapshotController.createNewSnapshot);
router.get('/snapshot/:id', snapshotController.fetchSnapshotById);

// ============================================================================
// Treasury Routes
// ============================================================================

router.get('/treasury/wallets', treasuryController.getTreasuryWallets);
router.post('/treasury/fetch-transactions', treasuryController.fetchTreasuryTransactions);
router.get('/treasury/wallet/:address/transactions', treasuryController.getWalletTransactions);

// ============================================================================
// Token Management Routes
// ============================================================================

router.post('/burn/krc20', burnController.burnKrc20Tokens);
router.post('/burn/kaspa', burnController.burnKaspaTokens);
router.post('/burn/return-gov', burnController.returnGovKaspaTokens);
router.post('/burn/drop-gas', burnController.dropKasGasTokens);
router.post('/burn/yes-wallet', burnController.burnYesWalletTokens);
router.post('/burn/no-wallet', burnController.burnNoWalletTokens);

// Apply error handling middleware last
router.use(errorHandler);

export default router; 