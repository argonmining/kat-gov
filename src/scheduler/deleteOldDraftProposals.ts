import cron from 'node-cron';
import { deleteOldDraftProposals } from '../models/proposalModels.js';
import { createModuleLogger } from '../utils/logger.js';
import { schedulerState } from './schedulerState.js';

const logger = createModuleLogger('deleteOldDraftProposals');

export async function runDraftCleanup() {
    return schedulerState.runTask('draftCleanup', async () => {
        logger.info('Starting draft proposal cleanup');
        const result = await deleteOldDraftProposals();
        logger.info({ deletedCount: result }, 'Draft proposal cleanup completed successfully');
        return result;
    });
}

// Run the task immediately when the application starts
(async () => {
    try {
        logger.info('Running initial draft proposal cleanup');
        await runDraftCleanup();
        logger.info('Initial draft proposal cleanup completed successfully');
    } catch (error) {
        const errorDetails = error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString()
        } : 'Unknown error';

        logger.error({ error: errorDetails }, 'Initial draft proposal cleanup failed');
    }
})();

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
    try {
        logger.info('Running scheduled draft proposal cleanup');
        await runDraftCleanup();
        logger.info('Scheduled draft proposal cleanup completed successfully');
    } catch (error) {
        const errorDetails = error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString()
        } : 'Unknown error';

        logger.error({ error: errorDetails }, 'Scheduled draft proposal cleanup failed');
    }
});
