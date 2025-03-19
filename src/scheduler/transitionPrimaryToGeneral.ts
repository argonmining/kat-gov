import { prisma } from '../config/prisma.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('transitionPrimaryToGeneral');

/**
 * Transitions a completed primary election to a general election by selecting the top two candidates
 * @param primaryId The ID of the primary election to transition
 */
export async function transitionPrimaryToGeneral(primaryId: number) {
  try {
    logger.info({ primaryId }, 'Starting transition from primary to general election');

    // Get the primary election with candidates and votes
    const primary = await prisma.election_primaries.findUnique({
      where: { id: primaryId },
      include: {
        election: true,
        primary_candidates: {
          include: {
            candidate_votes: true
          }
        }
      }
    });

    if (!primary) {
      throw new Error(`Primary election with ID ${primaryId} not found`);
    }

    if (!primary.approved || !primary.votesactive || !primary.closevote || primary.closevote > new Date()) {
      logger.info(
        { primaryId, approved: primary.approved, votesactive: primary.votesactive, closevote: primary.closevote },
        'Primary election not ready for transition'
      );
      return null;
    }

    // Calculate vote totals for each candidate
    const candidatesWithVotes = primary.primary_candidates.map(candidate => {
      const totalVotes = candidate.candidate_votes.reduce((sum, vote) => {
        if (vote.validvote) {
          return sum + (vote.votescounted || 0);
        }
        return sum;
      }, 0);

      return {
        candidate,
        totalVotes
      };
    });

    // Sort candidates by vote count (descending)
    const sortedCandidates = candidatesWithVotes.sort((a, b) => b.totalVotes - a.totalVotes);

    // Take top two candidates
    const topCandidates = sortedCandidates.slice(0, 2);
    
    if (topCandidates.length < 2) {
      logger.warn(
        { primaryId, candidateCount: topCandidates.length },
        'Insufficient candidates for general election (need at least 2)'
      );
      return null;
    }

    // Update the parent election with the top two candidates
    const updatedElection = await prisma.elections.update({
      where: { id: primary.election_id },
      data: {
        firstcandidate: topCandidates[0].candidate.id,
        secondcandidate: topCandidates[1].candidate.id,
        status: 5, // Assuming 5 is the status for "General Election"
        votesactive: true, // Activate voting for the general election
        openvote: new Date(), // Start voting now
        closevote: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Close in 7 days (configurable)
      }
    });

    // Update the primary election status to completed
    await prisma.election_primaries.update({
      where: { id: primaryId },
      data: {
        status: 10, // Assuming 10 is the status for "Completed"
        votesactive: false // Deactivate voting for the primary
      }
    });

    logger.info(
      { 
        primaryId, 
        electionId: updatedElection.id,
        firstCandidateId: topCandidates[0].candidate.id,
        firstCandidateVotes: topCandidates[0].totalVotes,
        secondCandidateId: topCandidates[1].candidate.id,
        secondCandidateVotes: topCandidates[1].totalVotes
      },
      'Successfully transitioned primary to general election'
    );

    return updatedElection;
  } catch (error) {
    logger.error({ error, primaryId }, 'Error transitioning primary to general election');
    throw error;
  }
}

/**
 * Checks for primary elections that have closed voting periods and transitions them to general elections
 */
export async function checkAndTransitionPrimaries() {
  try {
    logger.info('Checking for primaries to transition to general elections');

    // Find all primary elections that:
    // 1. Have voting active
    // 2. Are approved
    // 3. Have a closevote date in the past
    const eligiblePrimaries = await prisma.election_primaries.findMany({
      where: {
        votesactive: true,
        approved: true,
        closevote: {
          lt: new Date() // Voting period has ended
        }
      }
    });

    logger.info(`Found ${eligiblePrimaries.length} primaries eligible for transition`);

    // Process each eligible primary
    for (const primary of eligiblePrimaries) {
      try {
        await transitionPrimaryToGeneral(primary.id);
        logger.info(`Successfully transitioned primary ${primary.id} to general election`);
      } catch (error) {
        logger.error({ error, primaryId: primary.id }, 'Failed to transition primary');
        // Continue with next primary even if one fails
      }
    }

    return {
      success: true,
      message: `Processed ${eligiblePrimaries.length} primaries for transition`
    };
  } catch (error) {
    logger.error({ error }, 'Error in checkAndTransitionPrimaries scheduler');
    throw error;
  }
} 