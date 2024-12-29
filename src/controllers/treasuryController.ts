import { Request, Response } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';

const logger = createModuleLogger('treasuryController');

export async function fetchTreasuryTransactions(req: Request, res: Response) {
    try {
        logger.info('Manual treasury transactions fetch requested');
        await getTreasuryTransactions();
        logger.info('Manual treasury transactions fetch completed successfully');
        res.status(200).json({ message: 'Treasury transactions fetch completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Manual treasury transactions fetch failed');
        res.status(500).json({ error: 'Failed to fetch treasury transactions' });
    }
} 