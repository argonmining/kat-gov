import cron from 'node-cron';
import { deleteOldDraftProposals } from '../models/proposalModels.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('deleteOldDraftProposals');

// Run the task immediately when the application starts
(async () => {
  try {
    logger.info('Running initial task to delete old draft proposals');
    const result = await deleteOldDraftProposals();
    logger.info({ deletedCount: result }, 'Initial task completed successfully');
  } catch (error) {
    logger.error({ error }, 'Initial task failed');
  }
})();

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Running scheduled task to delete old draft proposals');
    const result = await deleteOldDraftProposals();
    logger.info({ deletedCount: result }, 'Scheduled task completed successfully');
  } catch (error) {
    logger.error({ error }, 'Scheduled task failed');
  }
});
