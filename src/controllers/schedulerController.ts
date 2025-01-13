import { Request, Response } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { runDraftCleanup } from '../scheduler/deleteOldDraftProposals.js';
import { activateProposalVoting } from '../scheduler/activateProposalVoting.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';
import { createElectionPrimaries } from '../scheduler/createElectionPrimaries.js';

const logger = createModuleLogger('schedulerController');

export const runDraftCleanupHandler = async (req: Request, res: Response): Promise<void> => {
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
};

export const runProposalVotingHandler = async (req: Request, res: Response): Promise<void> => {
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
};

export const runTreasuryTransactionsHandler = async (req: Request, res: Response): Promise<void> => {
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
};

export const runElectionPrimariesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Manual trigger: election primaries creation');
    const result = await createElectionPrimaries();
    res.status(200).json(result);
  } catch (error) {
    logger.error({ error }, 'Manual election primaries creation failed');
    res.status(500).json({ 
      success: false, 
      message: 'Election primaries creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 