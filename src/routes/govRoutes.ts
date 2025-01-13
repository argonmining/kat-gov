import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import * as proposalController from '../controllers/proposalController.js';
import * as electionController from '../controllers/electionController.js';
import * as snapshotController from '../controllers/snapshotController.js';
import * as burnController from '../controllers/burnController.js';
import * as treasuryController from '../controllers/treasuryController.js';
import * as cleanupController from '../controllers/cleanupController.js';
import * as candidateController from '../controllers/candidateController.js';
import { runDraftCleanup } from '../scheduler/deleteOldDraftProposals.js';
import activateProposalVoting from '../scheduler/activateProposalVoting.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';

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
// Snapshot Management Routes
// ============================================================================

router.get('/proposal/snapshots', snapshotController.fetchAllProposalSnapshots);
router.get('/election/snapshots', snapshotController.fetchAllElectionSnapshots);
router.post('/snapshot', snapshotController.createNewSnapshot);
router.get('/snapshot/:id', snapshotController.fetchSnapshotById);

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
// Proposal Routes - Static First
// ============================================================================

// Static proposal routes
router.get('/proposals', proposalController.fetchAllProposals);
router.post('/proposal', proposalController.submitProposal);
router.get('/proposal/types', proposalController.fetchAllProposalTypes);
router.post('/proposal/types', proposalController.addProposalType);
router.get('/proposal/statuses', proposalController.fetchAllProposalStatuses);
router.post('/proposal/statuses', proposalController.addProposalStatus);
router.get('/proposal/votes/yes', proposalController.fetchAllProposalYesVotes);
router.post('/proposal/votes/yes', proposalController.submitProposalYesVote);
router.get('/proposal/votes/no', proposalController.fetchAllProposalNoVotes);
router.post('/proposal/votes/no', proposalController.submitProposalNoVote);
router.post('/proposal/nomination/create', proposalController.verifyNominationTransaction);
router.get('/proposal/nomination/fee', proposalController.getNominationFee);

// Parameterized proposal routes with specific actions first
router.post('/proposal/:id/verify-edit', proposalController.verifyProposalEditWithExistingNomination);
router.get('/proposal/:id/votes', proposalController.fetchVotesForProposal);
router.get('/proposal/:id/nominations', proposalController.fetchNominationsForProposal);
router.get('/proposal/:id/nominations/count', proposalController.fetchNominationCount);
router.get('/proposal/:id/nominations/status', proposalController.getNominationVerificationStatus);

// Generic parameterized proposal routes
router.put('/proposal/types/:id', proposalController.modifyProposalType);
router.delete('/proposal/types/:id', proposalController.removeProposalType);
router.put('/proposal/statuses/:id', proposalController.modifyProposalStatus);
router.delete('/proposal/statuses/:id', proposalController.removeProposalStatus);
router.get('/proposal/:id', proposalController.fetchProposalById);
router.put('/proposal/:id', proposalController.modifyProposal);

// ============================================================================
// Election Routes - Static First
// ============================================================================

// Static election routes
router.get('/elections', electionController.fetchAllElections);
router.post('/election', electionController.submitElection);
router.get('/election/types', electionController.fetchAllElectionTypes);
router.post('/election/types', electionController.addElectionType);
router.get('/election/statuses', electionController.fetchAllElectionStatuses);
router.post('/election/statuses', electionController.addElectionStatus);
router.get('/election/positions', electionController.fetchAllElectionPositions);
router.post('/election/positions', electionController.addElectionPosition);
router.get('/election/candidates', electionController.fetchAllElectionCandidates);
router.post('/election/candidates', electionController.submitElectionCandidate);
router.get('/election/candidate/wallets', candidateController.fetchAllCandidateWallets);
router.post('/election/candidate/wallets', candidateController.addCandidateWallet);
router.get('/election/candidate/nominations', candidateController.fetchAllCandidateNominations);
router.post('/election/candidate/nominations', candidateController.submitCandidateNomination);
router.get('/election/nomination/fee', candidateController.getCandidateNominationFee);
router.post('/election/candidate/votes', candidateController.submitCandidateVote);

// Parameterized election routes
router.put('/election/types/:id', electionController.modifyElectionType);
router.delete('/election/types/:id', electionController.removeElectionType);
router.put('/election/statuses/:id', electionController.modifyElectionStatus);
router.delete('/election/statuses/:id', electionController.removeElectionStatus);
router.put('/election/positions/:id', electionController.modifyElectionPosition);
router.delete('/election/positions/:id', electionController.removeElectionPosition);
router.get('/election/:id', electionController.fetchElectionById);
router.put('/election/:id', electionController.modifyElection);
router.delete('/election/:id', electionController.removeElection);
router.put('/election/candidates/:id', electionController.modifyElectionCandidate);
router.delete('/election/candidates/:id', electionController.removeElectionCandidate);
router.get('/election/candidate/:candidateId/votes', candidateController.fetchVotesForCandidate);
router.put('/election/candidate/wallets/:id', candidateController.modifyCandidateWallet);
router.delete('/election/candidate/wallets/:id', candidateController.removeCandidateWallet);
router.put('/election/candidate/nominations/:id', candidateController.modifyCandidateNomination);
router.delete('/election/candidate/nominations/:id', candidateController.removeCandidateNomination);

// ============================================================================
// Treasury Management Routes
// ============================================================================

// Static treasury routes
router.post('/treasury/fetch-transactions', treasuryController.fetchTreasuryTransactions);
router.get('/treasury/wallets', treasuryController.getTreasuryWallets);

// Parameterized treasury routes
router.get('/treasury/wallet/:address/transactions', treasuryController.getWalletTransactions);

// ============================================================================
// System Maintenance Routes
// ============================================================================

router.post('/cleanup/draft-proposals', cleanupController.cleanupDraftProposals);

// Manual scheduler triggers
router.post('/scheduler/run/draft-cleanup', async (req: Request, res: Response) => {
    try {
        logger.info('Manual trigger: draft cleanup');
        const result = await runDraftCleanup();
        res.status(200).json({ 
            success: true, 
            message: 'Draft cleanup completed successfully',
            deletedCount: result 
        });
    } catch (error) {
        logger.error({ error }, 'Manual draft cleanup failed');
        res.status(500).json({ 
            success: false, 
            message: 'Draft cleanup failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.post('/scheduler/run/proposal-voting', async (req: Request, res: Response) => {
    try {
        logger.info('Manual trigger: proposal voting activation');
        await activateProposalVoting();
        res.status(200).json({ 
            success: true, 
            message: 'Proposal voting activation completed successfully' 
        });
    } catch (error) {
        logger.error({ error }, 'Manual proposal voting activation failed');
        res.status(500).json({ 
            success: false, 
            message: 'Proposal voting activation failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.post('/scheduler/run/treasury-transactions', async (req: Request, res: Response) => {
    try {
        logger.info('Manual trigger: treasury transactions fetch');
        await getTreasuryTransactions();
        res.status(200).json({ 
            success: true, 
            message: 'Treasury transactions fetch completed successfully' 
        });
    } catch (error) {
        logger.error({ error }, 'Manual treasury transactions fetch failed');
        res.status(500).json({ 
            success: false, 
            message: 'Treasury transactions fetch failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Apply error handling middleware last
router.use(errorHandler);

export default router; 