import { Request, Response } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { runDraftCleanup } from '../scheduler/deleteOldDraftProposals.js';
import { activateProposalVoting } from '../scheduler/activateProposalVoting.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';
import { createElectionPrimaries } from '../scheduler/createElectionPrimaries.js';
import { withDirectErrorHandling } from '../utils/errorHandler.js';

const logger = createModuleLogger('schedulerController');

// Raw handler implementations without try/catch blocks
const _runDraftCleanupHandler = async (req: Request, res: Response): Promise<void> => {
  logger.info('Manual trigger: draft cleanup');
  const result = await runDraftCleanup();
  res.status(200).json({ 
    success: true, 
    message: 'Draft cleanup completed successfully',
    deletedCount: result 
  });
};

const _runProposalVotingHandler = async (req: Request, res: Response): Promise<void> => {
  logger.info('Manual trigger: proposal voting activation');
  await activateProposalVoting();
  res.status(200).json({ 
    success: true, 
    message: 'Proposal voting activation completed successfully' 
  });
};

const _runTreasuryTransactionsHandler = async (req: Request, res: Response): Promise<void> => {
  logger.info('Manual trigger: treasury transactions fetch');
  await getTreasuryTransactions();
  res.status(200).json({ 
    success: true, 
    message: 'Treasury transactions fetch completed successfully' 
  });
};

const _runElectionPrimariesHandler = async (req: Request, res: Response): Promise<void> => {
  logger.info('Manual trigger: election primaries creation');
  const result = await createElectionPrimaries();
  res.status(200).json(result);
};

// Exported handlers with error handling
export const runDraftCleanupHandler = withDirectErrorHandling(_runDraftCleanupHandler, logger);
export const runProposalVotingHandler = withDirectErrorHandling(_runProposalVotingHandler, logger);
export const runTreasuryTransactionsHandler = withDirectErrorHandling(_runTreasuryTransactionsHandler, logger);
export const runElectionPrimariesHandler = withDirectErrorHandling(_runElectionPrimariesHandler, logger); 