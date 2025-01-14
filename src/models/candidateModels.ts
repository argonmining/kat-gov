import { prisma } from '../config/prisma.js';
import { createModuleLogger } from '../utils/logger.js';
import {
  CandidateNomination,
  CandidateWallet,
  CandidateStatus
} from '../types/candidateTypes.js';
import { CandidateVote } from '../types/electionTypes.js';
import { Decimal } from '@prisma/client/runtime/library';
import { createKaspaWallet } from '../utils/walletUtils.js';
import { config } from '../config/env.js';
import { proposalEditFee } from '../utils/tokenCalcs.js';

const logger = createModuleLogger('candidateModels');

// Candidate Votes
export const createCandidateVote = async (vote: { 
  candidate_id: number;
  toaddress: string;
  amountsent: number | Decimal;
  hash?: string | null;
  created: Date;
  votescounted?: number | null;
  validvote: boolean;
  election_snapshot_id?: number | null;
}): Promise<CandidateVote> => {
  try {
    const { candidate_id, toaddress, amountsent, hash, created, votescounted, validvote, election_snapshot_id } = vote;
    logger.info({ candidate_id, toaddress, amountsent }, 'Creating candidate vote');
    const result = await prisma.candidate_votes.create({
      data: {
        candidate_id,
        toaddress,
        amountsent: new Decimal(amountsent.toString()),
        hash,
        created,
        votescounted,
        validvote,
        election_snapshot_id
      }
    });
    logger.debug({ id: result.id }, 'Candidate vote created successfully');
    return result as unknown as CandidateVote;
  } catch (error) {
    logger.error({ error, vote }, 'Error creating candidate vote');
    throw new Error('Could not create candidate vote');
  }
};

export const getVotesForCandidate = async (candidateId: number): Promise<CandidateVote[]> => {
  try {
    logger.info({ candidateId }, 'Fetching votes for candidate');
    const result = await prisma.candidate_votes.findMany({
      where: {
        candidate_id: candidateId
      }
    });
    logger.debug({ count: result.length }, 'Retrieved candidate votes');
    return result as unknown as CandidateVote[];
  } catch (error) {
    logger.error({ error, candidateId }, 'Error fetching votes for candidate');
    throw new Error('Could not fetch votes for candidate');
  }
};

// Candidate Nominations
export const getAllCandidateNominations = async (): Promise<CandidateNomination[]> => {
  try {
    logger.info('Fetching all candidate nominations');
    const result = await prisma.candidate_nominations.findMany();
    logger.debug({ count: result.length }, 'Retrieved all candidate nominations');
    return result as unknown as CandidateNomination[];
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate nominations');
    throw new Error('Could not fetch candidate nominations');
  }
};

export const createCandidateNomination = async (nomination: {
  candidate_id: number;
  toaddress: string;
  amountsent: number | Decimal;
  created: Date;
}): Promise<CandidateNomination> => {
  try {
    const { candidate_id, toaddress, amountsent, created } = nomination;
    logger.info({ candidate_id, toaddress, amountsent }, 'Creating candidate nomination');
    const result = await prisma.candidate_nominations.create({
      data: {
        candidate_id,
        toaddress,
        amountsent: new Decimal(amountsent.toString()),
        created,
        validvote: true
      }
    });
    logger.debug({ id: result.id }, 'Candidate nomination created successfully');
    return result as unknown as CandidateNomination;
  } catch (error) {
    logger.error({ error, nomination }, 'Error creating candidate nomination');
    throw new Error('Could not create candidate nomination');
  }
};

export const updateCandidateNomination = async (id: number, nomination: {
  amountsent?: number | Decimal;
}): Promise<CandidateNomination> => {
  try {
    const { amountsent } = nomination;
    logger.info({ id, amountsent }, 'Updating candidate nomination');
    const result = await prisma.candidate_nominations.update({
      where: { id },
      data: {
        amountsent: amountsent ? new Decimal(amountsent.toString()) : undefined
      }
    });
    logger.debug({ id }, 'Candidate nomination updated successfully');
    return result as unknown as CandidateNomination;
  } catch (error) {
    logger.error({ error, id, nomination }, 'Error updating candidate nomination');
    throw new Error('Could not update candidate nomination');
  }
};

export const deleteCandidateNomination = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate nomination');
    await prisma.candidate_nominations.delete({
      where: { id }
    });
    logger.debug({ id }, 'Candidate nomination deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate nomination');
    throw new Error('Could not delete candidate nomination');
  }
};

// Candidate Wallets
export const getAllCandidateWallets = async (): Promise<CandidateWallet[]> => {
  try {
    logger.info('Fetching all candidate wallets');
    const result = await prisma.candidate_wallets.findMany({
      select: {
        id: true,
        address: true,
        balance: true,
        created: true,
        active: true,
        candidate_id: true
      }
    });
    logger.debug({ count: result.length }, 'Retrieved all candidate wallets');
    return result as unknown as CandidateWallet[];
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate wallets');
    throw new Error('Could not fetch candidate wallets');
  }
};

export const createCandidateWallet = async (address: string, encryptedPrivateKey: string, candidate_id: number): Promise<CandidateWallet> => {
  try {
    logger.info({ address, candidate_id }, 'Creating candidate wallet');
    const result = await prisma.candidate_wallets.create({
      data: {
        address,
        encryptedprivatekey: encryptedPrivateKey,
        active: true,
        created: new Date(),
        balance: new Decimal('0'),
        candidate_id
      }
    });
    logger.debug({ id: result.id }, 'Candidate wallet created successfully');
    return result as unknown as CandidateWallet;
  } catch (error) {
    logger.error({ error, address, candidate_id }, 'Error creating candidate wallet');
    throw new Error('Could not create candidate wallet');
  }
};

export const updateCandidateWallet = async (id: number, address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    logger.info({ id, address }, 'Updating candidate wallet');
    const result = await prisma.candidate_wallets.update({
      where: { id },
      data: {
        address,
        encryptedprivatekey: encryptedPrivateKey
      }
    });
    logger.debug({ id }, 'Candidate wallet updated successfully');
    return result as unknown as CandidateWallet;
  } catch (error) {
    logger.error({ error, id, address }, 'Error updating candidate wallet');
    throw new Error('Could not update candidate wallet');
  }
};

export const deleteCandidateWallet = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate wallet');
    await prisma.candidate_wallets.delete({
      where: { id }
    });
    logger.debug({ id }, 'Candidate wallet deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate wallet');
    throw new Error('Could not delete candidate wallet');
  }
};

// Candidate Statuses
export const getAllCandidateStatuses = async (): Promise<CandidateStatus[]> => {
  try {
    logger.info('Fetching all candidate statuses');
    const result = await prisma.candidate_statuses.findMany();
    logger.debug({ count: result.length }, 'Retrieved all candidate statuses');
    return result as unknown as CandidateStatus[];
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate statuses');
    throw new Error('Could not fetch candidate statuses');
  }
};

export const createCandidateStatus = async (name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    logger.info({ name, active }, 'Creating candidate status');
    const result = await prisma.candidate_statuses.create({
      data: {
        name,
        active
      }
    });
    logger.debug({ id: result.id }, 'Candidate status created successfully');
    return result as unknown as CandidateStatus;
  } catch (error) {
    logger.error({ error, name, active }, 'Error creating candidate status');
    throw new Error('Could not create candidate status');
  }
};

export const updateCandidateStatus = async (id: number, name: string, active: boolean): Promise<CandidateStatus> => {
  try {
    logger.info({ id, name, active }, 'Updating candidate status');
    const result = await prisma.candidate_statuses.update({
      where: { id },
      data: {
        name,
        active
      }
    });
    logger.debug({ id }, 'Candidate status updated successfully');
    return result as unknown as CandidateStatus;
  } catch (error) {
    logger.error({ error, id, name, active }, 'Error updating candidate status');
    throw new Error('Could not update candidate status');
  }
};

export const deleteCandidateStatus = async (id: number): Promise<void> => {
  try {
    logger.info({ id }, 'Deleting candidate status');
    await prisma.candidate_statuses.delete({
      where: { id }
    });
    logger.debug({ id }, 'Candidate status deleted successfully');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting candidate status');
    throw new Error('Could not delete candidate status');
  }
};

// Get encrypted private key for a wallet
export const getEncryptedPrivateKey = async (walletId: number): Promise<string | null> => {
  try {
    logger.info({ walletId }, 'Fetching encrypted private key');
    const result = await prisma.candidate_wallets.findUnique({
      where: { id: walletId },
      select: { encryptedprivatekey: true }
    });
    const key = result?.encryptedprivatekey || null;
    if (!key) {
      logger.warn({ walletId }, 'No encrypted private key found');
    } else {
      logger.debug({ walletId }, 'Encrypted private key retrieved successfully');
    }
    return key;
  } catch (error) {
    logger.error({ error, walletId }, 'Error fetching encrypted private key');
    throw new Error('Could not fetch encrypted private key');
  }
};

// Primary Candidate Functions
export const verifyPrimaryCandidateTransaction = async (data: {
  fee: number;
  primaryId: number;
}): Promise<any> => {
  try {
    logger.info({ primaryId: data.primaryId, fee: data.fee }, 'Verifying primary candidate transaction');

    // Get the primary election
    const primary = await prisma.election_primaries.findUnique({
      where: { id: data.primaryId },
      include: {
        election: true
      }
    });

    if (!primary) {
      throw new Error('Primary election not found');
    }

    // Calculate expected fee
    const expectedFee = await proposalEditFee();
    if (data.fee < expectedFee) {
      throw new Error('Insufficient fee amount');
    }

    // Get the wallet for fee collection
    const feeWallet = await prisma.proposal_wallets.findFirst({
      where: {
        active: true,
        proposal_id: primary.election.id
      }
    });

    if (!feeWallet?.address) {
      throw new Error('Fee collection wallet not found');
    }

    // Generate a verification ID that includes the primary ID, target amount, and timestamp
    const timestamp = Date.now();
    const targetAmount = new Decimal(data.fee).mul(new Decimal('100000000')).toNumber();
    const verificationId = Buffer.from(`${data.primaryId}-${targetAmount}-${timestamp}`).toString('base64');

    logger.debug({ primaryId: data.primaryId }, 'Primary candidate transaction verification initiated');
    return {
      status: 'pending',
      message: 'Verification process started',
      retryAfter: 3, // seconds
      verificationId,
      expectedAmount: targetAmount,
      address: feeWallet.address,
      ticker: config.tokens.govTokenTicker
    };
  } catch (error) {
    logger.error({ error }, 'Error verifying primary candidate transaction');
    throw error;
  }
};

export const getPrimaryCandidateVerification = async (primaryId: number, verificationId: string): Promise<any> => {
  try {
    logger.info({ primaryId, verificationId }, 'Getting primary candidate verification status');

    // Get the primary election
    const primary = await prisma.election_primaries.findUnique({
      where: { id: primaryId },
      include: {
        election: true
      }
    });

    if (!primary) {
      throw new Error('Primary election not found');
    }

    // Decode the verification ID to get the target amount and timestamp
    const [encodedPrimaryId, encodedAmount, timestamp] = Buffer.from(verificationId, 'base64')
      .toString()
      .split('-');

    if (Number(encodedPrimaryId) !== primaryId) {
      throw new Error('Invalid verification ID');
    }

    // Get the wallet for fee collection
    const feeWallet = await prisma.proposal_wallets.findFirst({
      where: {
        active: true,
        proposal_id: primary.election.id
      }
    });

    if (!feeWallet?.address) {
      throw new Error('Fee collection wallet not found');
    }

    // Check for KRC-20 transactions to this wallet
    const response = await fetch(`${config.kasplex.apiBaseUrl}/operations?address=${feeWallet.address}&tick=${config.tokens.govTokenTicker}`);
    const data = await response.json();

    if (data?.result && Array.isArray(data.result)) {
      // Look for transactions after the verification started
      for (const operation of data.result) {
        // Convert operation amount to number for comparison
        const operationAmount = operation.amt ? Number(operation.amt) : 0;
        const operationTimestamp = new Date(Number(operation.mtsAdd)).getTime();

        const matches = {
          to: operation.to === feeWallet.address,
          amount: operationAmount === Number(encodedAmount),
          tick: operation.tick === config.tokens.govTokenTicker,
          timestamp: operationTimestamp > (Number(timestamp) - 3600000) // Accept transactions from last hour
        };

        if (matches.to && matches.amount && matches.tick && matches.timestamp) {
          logger.info({ 
            primaryId,
            hashRev: operation.hashRev,
            amount: operation.amt,
            tick: operation.tick,
            fromAddress: operation.from
          }, 'Found matching transaction');

          return {
            status: 'completed',
            transaction: {
              hash: operation.hashRev,
              amount: operation.amt,
              from: operation.from,
              to: operation.to,
              ticker: operation.tick
            }
          };
        }
      }
    }

    // If no matching transaction found, return pending status
    return {
      status: 'pending',
      message: 'Verification in progress'
    };
  } catch (error) {
    logger.error({ error }, 'Error getting primary candidate verification status');
    throw error;
  }
};

export const createPrimaryCandidate = async (candidate: {
  name: string;
  description: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  type: number;
  status: number;
  primaryId: number;
  submitted: Date;
  verificationId: string;
}): Promise<any> => {
  try {
    const { 
      name,
      description,
      twitter,
      discord,
      telegram,
      type,
      status,
      primaryId,
      submitted,
      verificationId
    } = candidate;
    
    logger.info({ name, type, status, primaryId }, 'Creating primary candidate');
    
    // First verify the transaction is completed
    const verification = await getPrimaryCandidateVerification(primaryId, verificationId);
    if (verification.status !== 'completed') {
      throw new Error('Transaction verification not completed');
    }
    
    // Verify primary election exists and get current candidates
    const primary = await prisma.election_primaries.findUnique({
      where: { id: primaryId },
      select: { candidates: true }
    });

    if (!primary) {
      throw new Error('Primary election not found');
    }
    
    // Convert to database format
    const createData = {
      name,
      description,
      twitter: twitter ?? null,
      discord: discord ?? null,
      telegram: telegram ?? null,
      type,
      status,
      created: submitted,
      active: true
    };
    
    // Start a transaction to create both candidate and wallet
    const result = await prisma.$transaction(async (prisma) => {
      // Create the candidate
      const newCandidate = await prisma.election_candidates.create({
        data: createData
      });

      // Create a wallet for the candidate using existing wallet utils
      const { address, encryptedPrivateKey } = await createKaspaWallet();
      
      // Create the wallet record
      const wallet = await prisma.candidate_wallets.create({
        data: {
          address,
          encryptedprivatekey: encryptedPrivateKey,
          candidate_id: newCandidate.id,
          active: true,
          created: submitted,
          balance: new Decimal('0')
        }
      });

      // Update the candidate with the wallet ID
      await prisma.election_candidates.update({
        where: { id: newCandidate.id },
        data: {
          wallet: wallet.id
        }
      });

      // Update primary election with candidate ID array
      await prisma.$executeRaw`UPDATE election_primaries SET candidates = array_append(candidates, ${newCandidate.id}) WHERE id = ${primaryId}`;

      return {
        ...newCandidate,
        wallet: address,
        transaction: verification.transaction
      };
    });

    logger.debug({ id: result.id }, 'Primary candidate created successfully');
    return result;
  } catch (error) {
    logger.error({ error, candidate }, 'Error creating primary candidate');
    throw error;
  }
};
 