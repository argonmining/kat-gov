import cron from 'node-cron';
import { deleteOldDraftProposals } from '../models/Proposals.js';

// Run the task immediately when the application starts
(async () => {
  try {
    console.log('Running initial task to delete old draft proposals...');
    await deleteOldDraftProposals();
  } catch (error) {
    console.error('Initial task failed:', error);
  }
})();

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled task to delete old draft proposals...');
    await deleteOldDraftProposals();
  } catch (error) {
    console.error('Scheduled task failed:', error);
  }
});
