import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger.js';
import { schedulerState } from './schedulerState.js';

const logger = createModuleLogger('activateProposalVoting');
const prisma = new PrismaClient();

export async function activateProposalVoting() {
  return schedulerState.runTask('proposalVotingActivation', async () => {
    try {
      logger.info('Starting proposal voting activation check');

      // Find all proposals that meet our criteria
      const proposalsToActivate = await prisma.proposals.findMany({
        where: {
          // Voting not already active
          votesactive: {
            not: true
          },
          // Open vote time has arrived
          openvote: {
            lte: new Date()
          }
        },
        include: {
          // Include nominations to count them
          proposal_nominations: true
        }
      });

      logger.info(`Found ${proposalsToActivate.length} proposals to check for activation`);

      // Process each proposal
      for (const proposal of proposalsToActivate) {
        // Check if proposal has enough nominations
        if (proposal.proposal_nominations.length >= 10) {
          try {
            // Update the proposal to activate voting
            await prisma.proposals.update({
              where: {
                id: proposal.id
              },
              data: {
                votesactive: true
              }
            });

            logger.info({
              proposalId: proposal.id,
              nominationCount: proposal.proposal_nominations.length
            }, `Activated voting for proposal`);
          } catch (error) {
            logger.error({
              error: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack
              } : 'Unknown error',
              proposalId: proposal.id
            }, 'Error updating proposal voting status');
          }
        } else {
          logger.debug({
            proposalId: proposal.id,
            nominationCount: proposal.proposal_nominations.length
          }, 'Proposal does not have enough nominations yet');
        }
      }

      logger.info('Completed proposal voting activation check');
    } catch (error) {
      logger.error({
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : 'Unknown error'
      }, 'Error in proposal voting activation scheduler');
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  });
}

// Run the task immediately when the application starts
(async () => {
  try {
    logger.info('Running initial proposal voting activation check');
    await activateProposalVoting();
    logger.info('Initial proposal voting activation completed successfully');
  } catch (error) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    } : 'Unknown error';

    logger.error({ error: errorDetails }, 'Initial proposal voting activation failed');
  }
})();

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Running scheduled proposal voting activation check');
    await activateProposalVoting();
    logger.info('Scheduled proposal voting activation completed successfully');
  } catch (error) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    } : 'Unknown error';

    logger.error({ error: errorDetails }, 'Scheduled proposal voting activation failed');
  }
});

export default activateProposalVoting; 