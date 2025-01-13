import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger.js';

const prisma = new PrismaClient();
const logger = createModuleLogger('createElectionPrimaries');

export async function createElectionPrimary(electionId: number) {
  try {
    // Check if election exists and isn't already in a primary
    const existingPrimary = await prisma.election_primaries.findFirst({
      where: {
        election_id: electionId
      }
    });

    if (existingPrimary) {
      throw new Error('Primary already exists for this election');
    }

    // Get the election data
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        election_types: true,
        election_positions: true,
        election_statuses: true
      }
    });

    if (!election) {
      throw new Error('Election not found');
    }

    // Create a new snapshot
    const newSnapshot = await prisma.election_snapshots.create({
      data: {
        generated: new Date(),
        data: {}, // You'll need to implement the snapshot data generation
        proposal_id: null
      }
    });

    // Create the primary record
    const primary = await prisma.election_primaries.create({
      data: {
        title: `Primary: ${election.title}`,
        description: `Primary: ${election.description}`,
        reviewed: true,
        approved: null,
        votesactive: null,
        openvote: null,
        closevote: null,
        created: new Date(),
        type: election.type,
        position: election.position,
        candidates: null,
        status: 4, // Assuming 4 is the correct status ID
        snapshot: newSnapshot.id,
        election_id: electionId
      }
    });

    return primary;
  } catch (error) {
    logger.error('Error creating election primary:', error);
    throw error;
  }
}

export async function createElectionPrimaries() {
  try {
    // Find all eligible elections (status 3 and reviewed true)
    const eligibleElections = await prisma.elections.findMany({
      where: {
        status: 3,
        reviewed: true,
        // Make sure there isn't already a primary
        primary: null
      }
    });

    logger.info(`Found ${eligibleElections.length} eligible elections for primary creation`);

    // Process each eligible election
    for (const election of eligibleElections) {
      try {
        await createElectionPrimary(election.id);
        logger.info(`Successfully created primary for election ${election.id}`);
      } catch (error) {
        logger.error(`Failed to create primary for election ${election.id}:`, error);
        // Continue with next election even if one fails
        continue;
      }
    }

    return {
      success: true,
      message: `Processed ${eligibleElections.length} elections for primary creation`
    };
  } catch (error) {
    logger.error('Error in createElectionPrimaries scheduler:', error);
    return {
      success: false,
      message: 'Failed to process elections for primary creation'
    };
  }
}