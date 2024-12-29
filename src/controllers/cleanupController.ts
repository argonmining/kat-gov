import { Request, Response } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { runDraftCleanup } from '../scheduler/deleteOldDraftProposals.js';

const logger = createModuleLogger('cleanupController');

export async function cleanupDraftProposals(req: Request, res: Response) {
    try {
        logger.info('Manual draft proposal cleanup requested');
        await runDraftCleanup();
        logger.info('Manual draft proposal cleanup completed successfully');
        res.status(200).json({ message: 'Draft proposal cleanup completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Manual draft proposal cleanup failed');
        res.status(500).json({ error: 'Failed to cleanup draft proposals' });
    }
} 