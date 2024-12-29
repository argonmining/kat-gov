import cron from 'node-cron';
import { deleteOldDraftProposals } from '../models/proposalModels.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('deleteOldDraftProposals');

// Add a lock mechanism to prevent concurrent runs
let isDraftCleanupRunning = false;

export async function runDraftCleanup() {
    if (isDraftCleanupRunning) {
        logger.warn('Draft proposal cleanup already in progress, skipping');
        return;
    }

    isDraftCleanupRunning = true;
    try {
        logger.info('Starting draft proposal cleanup');
        const result = await deleteOldDraftProposals();
        logger.info({ deletedCount: result }, 'Draft proposal cleanup completed successfully');
    } catch (error) {
        logger.error({ error }, 'Error in draft proposal cleanup');
        throw error;
    } finally {
        isDraftCleanupRunning = false;
    }
}

// Run the task immediately when the application starts
(async () => {
    try {
        logger.info('Running initial draft proposal cleanup');
        await runDraftCleanup();
        logger.info('Initial draft proposal cleanup completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial draft proposal cleanup failed');
    }
})();

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
    try {
        logger.info('Running scheduled draft proposal cleanup');
        await runDraftCleanup();
        logger.info('Scheduled draft proposal cleanup completed successfully');
    } catch (error) {
        logger.error({ error }, 'Scheduled draft proposal cleanup failed');
    }
});
