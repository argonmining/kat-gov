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

      // Create UTC date for comparison
      const currentUTCDate = new Date();
      currentUTCDate.setSeconds(0, 0); // Zero out seconds and milliseconds for cleaner comparison
      logger.debug({ currentUTCDate }, 'Using UTC date for comparison');

      // Find all proposals that meet our criteria
      const proposalsToActivate = await prisma.proposals.findMany({
        where: {
          // Voting not already active
          votesactive: {
            not: true
          },
          // Open vote time has arrived (using UTC)
          openvote: {
            lte: currentUTCDate
          },
          // Not archived
          status: {
            not: 10 // Assuming 10 is the Archived status ID
          }
        },
        include: {
          // Include nominations to count them
          proposal_nominations: true,
          proposal_statuses: true
        }
      });

      logger.info({ 
        proposalsCount: proposalsToActivate.length,
        currentUTCDate: currentUTCDate.toISOString(),
        proposals: proposalsToActivate.map(p => ({
          id: p.id,
          votesactive: p.votesactive,
          openvote: p.openvote?.toISOString(),
          nominationCount: p.proposal_nominations.length,
          status: p.proposal_statuses?.name,
          statusId: p.status
        }))
      }, `Found ${proposalsToActivate.length} proposals to check for activation`);

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
              nominationCount: proposal.proposal_nominations.length,
              openVoteTime: proposal.openvote?.toISOString(),
              activationTime: currentUTCDate.toISOString(),
              status: proposal.proposal_statuses?.name,
              statusId: proposal.status
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
            nominationCount: proposal.proposal_nominations.length,
            openVoteTime: proposal.openvote?.toISOString(),
            status: proposal.proposal_statuses?.name,
            statusId: proposal.status,
            requiresNominations: 10 - proposal.proposal_nominations.length
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