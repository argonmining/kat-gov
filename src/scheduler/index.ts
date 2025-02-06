import cron from 'node-cron';
import { createModuleLogger } from '../utils/logger.js';
import { runDraftCleanup } from './deleteOldDraftProposals.js';
import activateProposalVoting from './activateProposalVoting.js';
import { getTreasuryTransactions } from './getTreasuryTransactions.js';
import { createElectionPrimaries } from './createElectionPrimaries.js';

const logger = createModuleLogger('scheduler');

// Initialize all scheduled tasks
export async function initializeScheduledTasks() {
    logger.info('Starting sequential initialization of scheduled tasks');

    // Run initial tasks in sequence
    try {
        logger.info('Running draft cleanup');
        await runDraftCleanup();
        logger.info('Draft cleanup completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial draft cleanup failed');
    }

    try {
        logger.info('Running proposal voting activation');
        await activateProposalVoting();
        logger.info('Proposal voting activation completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial proposal voting activation failed');
    }

    try {
        logger.info('Running treasury transactions fetch');
        await getTreasuryTransactions();
        logger.info('Treasury transactions fetch completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial treasury transactions fetch failed');
    }

    try {
        logger.info('Running election primaries creation');
        await createElectionPrimaries();
        logger.info('Election primaries creation completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial election primaries creation failed');
    }

    // Set up recurring schedules
    try {
        logger.info('Setting up scheduled tasks');

        // Draft cleanup - every 4 hours, at minute 0
        cron.schedule('0 0,4,8,12,16,20 * * *', async () => {
            try {
                logger.info('Running scheduled draft cleanup');
                await runDraftCleanup();
                logger.info('Scheduled draft cleanup completed successfully');
            } catch (error) {
                logger.error({ error }, 'Scheduled draft cleanup failed');
            }
        });

        // Proposal voting activation - every hour, at minute 15
        cron.schedule('15 * * * *', async () => {
            try {
                logger.info('Running scheduled proposal voting activation');
                await activateProposalVoting();
                logger.info('Scheduled proposal voting activation completed successfully');
            } catch (error) {
                logger.error({ error }, 'Scheduled proposal voting activation failed');
            }
        });

        // Treasury transactions - every 12 hours, at minute 30
        cron.schedule('30 0,12 * * *', async () => {
            try {
                logger.info('Running scheduled treasury transactions fetch');
                await getTreasuryTransactions();
                logger.info('Scheduled treasury transactions fetch completed successfully');
            } catch (error) {
                logger.error({ error }, 'Scheduled treasury transactions fetch failed');
            }
        });

        // Election primaries creation - every 3 hours, at minute 45
        cron.schedule('45 */3 * * *', async () => {
            try {
                logger.info('Running scheduled election primaries creation');
                await createElectionPrimaries();
                logger.info('Scheduled election primaries creation completed successfully');
            } catch (error) {
                logger.error({ error }, 'Scheduled election primaries creation failed');
            }
        });

        logger.info('All schedules initialized successfully');
        logger.info('Schedule times:');
        logger.info('- Draft cleanup: Every 4 hours at :00');
        logger.info('- Proposal voting: Every hour at :15');
        logger.info('- Treasury transactions: 00:30 and 12:30 daily');
        logger.info('- Election primaries: Every 3 hours at :45');
    } catch (error) {
        logger.error({ error }, 'Critical error: Failed to initialize scheduled tasks');
        throw error;
    }
} 