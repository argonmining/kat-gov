import { Request, Response } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { runDraftCleanup } from '../scheduler/deleteOldDraftProposals.js';
import { withDirectErrorHandling } from '../utils/errorHandler.js';

const logger = createModuleLogger('cleanupController');

// Raw handler without try/catch block
const _cleanupDraftProposals = async (req: Request, res: Response) => {
    logger.info('Manual draft proposal cleanup requested');
    await runDraftCleanup();
    logger.info('Manual draft proposal cleanup completed successfully');
    res.status(200).json({ message: 'Draft proposal cleanup completed successfully' });
};

// Exported handler with error handling
export const cleanupDraftProposals = withDirectErrorHandling(_cleanupDraftProposals, logger); 