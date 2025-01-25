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
import { getKRC20OperationList } from '../services/kasplexAPI.js';

const logger = createModuleLogger('candidateModels');

// In-memory verification store
export const verificationStore = new Map<string, {
  primaryId: number;
  expectedAmount: number;
  walletAddress: string;
  tokenTicker: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  transaction?: {
    hash: string;
    amount: string;
    from: string;
    to: string;
    ticker: string;
  };
  error?: string;
}>();

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

interface VerificationResult {
  status: 'pending' | 'completed' | 'failed';
  transaction?: {
    hash: string;
    amount: string;
    from: string;
    to: string;
    ticker: string;
  };
  error?: string;
  message?: string;
}

interface VerificationData {
  fee: number;
  primaryId: number;
  candidateId: number;
}

export const verifyPrimaryCandidateTransaction = async (data: {
  fee: number;
  primaryId: number;
  candidateId: number;
}): Promise<{
  status: string;
  message: string;
  retryAfter: number;
  verificationId: string;
  expectedAmount: number;
  address: string;
  ticker: string;
}> => {
  try {
    logger.info({ primaryId: data.primaryId, fee: data.fee }, 'Verifying primary candidate transaction');

    // Get the primary election with its election data
    const primary = await prisma.election_primaries.findUnique({
      where: { id: data.primaryId },
      include: {
        election: true,
        primary_candidates: true
      }
    });

    if (!primary) {
      throw new Error('Primary election not found');
    }

    // Ensure GOV token ticker is configured
    const govTokenTicker = config.tokens.govTokenTicker;
    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not configured');
    }

    // Get the fee collection wallet
    const feeWallet = await prisma.proposal_wallets.findFirst({
      where: {
        active: true,
        proposal_id: primary.election.id
      }
    });

    if (!feeWallet?.address) {
      throw new Error('Fee collection wallet not found');
    }

    const walletAddress = feeWallet.address;

    // Convert fee to sompi (1 KAS = 100000000 sompi) using Decimal for precise math
    const targetAmount = new Decimal(data.fee).mul(new Decimal('100000000')).toNumber();
    logger.debug({ walletAddress, targetAmount, originalFee: data.fee }, 'Checking for transaction with calculated amount');

    // Generate a verification ID that includes the primary ID, target amount, and timestamp
    const timestamp = Date.now();
    const verificationId = Buffer.from(`${data.primaryId}-${targetAmount}-${timestamp}`).toString('base64');

    // Check for existing nominations for this primary
    const existingNominations = await prisma.candidate_nominations.findMany({
      where: {
        candidate_id: data.primaryId
      }
    });

    // Store verification state in memory
    verificationStore.set(verificationId, {
      primaryId: data.primaryId,
      expectedAmount: targetAmount,
      walletAddress,
      tokenTicker: govTokenTicker,
      timestamp,
      status: 'pending'
    });

    // Start verification process in the background
    (async () => {
      let transactionCheckAttempts = 0;
      const maxAttempts = 30; // 90 seconds with 3-second intervals

      while (transactionCheckAttempts < maxAttempts) {
        try {
          const response = await getKRC20OperationList({
            address: walletAddress,
            tick: govTokenTicker
          });

          if (response?.result && Array.isArray(response.result)) {
            // Look for transactions after the verification started
            for (const operation of response.result) {
              // Validate operation fields
              if (!operation.from || !operation.to || !operation.txAccept) {
                logger.warn({ operation }, 'Invalid operation fields');
                continue;
              }

              // Check if this address has already nominated
              const hasExistingNomination = existingNominations.some(
                (nom: { toaddress: string | null }) => 
                  nom.toaddress && operation.from && 
                  nom.toaddress.toLowerCase() === operation.from.toLowerCase()
              );

              if (hasExistingNomination) {
                logger.warn({ 
                  fromAddress: operation.from,
                  primaryId: data.primaryId 
                }, 'Address has already nominated this primary');
                continue;
              }

              // Convert operation amount to number for comparison
              const operationAmount = Number(operation.amt);
              const operationTimestamp = new Date(Number(operation.mtsAdd)).getTime();

              const matches = {
                to: operation.to === walletAddress,
                amount: operationAmount === targetAmount,
                tick: operation.tick === govTokenTicker,
                timestamp: operationTimestamp > (timestamp - 3600000), // Accept transactions from last hour
                txAccept: operation.txAccept === '1',
                opAccept: operation.opAccept === '1'
              };

              if (Object.values(matches).every(match => match)) {
                // Store successful verification
                verificationStore.set(verificationId, {
                  primaryId: data.primaryId,
                  expectedAmount: targetAmount,
                  walletAddress,
                  tokenTicker: govTokenTicker,
                  timestamp,
                  status: 'completed',
                  transaction: {
                    hash: operation.hashRev,
                    amount: operation.amt,
                    from: operation.from,
                    to: operation.to,
                    ticker: operation.tick
                  }
                });

                logger.info({ 
                  primaryId: data.primaryId,
                  verificationId,
                  transaction: operation
                }, 'Transaction verified successfully');

                // Create nomination record
                const nominationData = {
                  toaddress: operation.from ?? null,
                  fromaddress: operation.to ?? null,
                  hash: operation.txAccept ?? null,
                  candidate_id: data.candidateId,
                  primary_id: data.primaryId,
                  validvote: true,
                  amountsent: new Decimal(operationAmount.toString()),
                  created: new Date()
                };

                await prisma.candidate_nominations.create({
                  data: nominationData
                });

                // Get the verification data from the store
                const verificationData = verificationStore.get(verificationId);
                if (!verificationData) {
                  throw new Error('Verification data not found');
                }

                return {
                  status: 'success',
                  message: 'Transaction verified successfully',
                  retryAfter: 0,
                  verificationId: verificationId,
                  expectedAmount: data.fee,
                  address: verificationData.walletAddress,
                  ticker: verificationData.tokenTicker
                };
              }
            }
          }

          transactionCheckAttempts++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          logger.error({ error, primaryId: data.primaryId }, 'Error during transaction check');
          verificationStore.set(verificationId, {
            primaryId: data.primaryId,
            expectedAmount: targetAmount,
            walletAddress,
            tokenTicker: govTokenTicker,
            timestamp,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return;
        }
      }

      // Handle timeout
      verificationStore.set(verificationId, {
        primaryId: data.primaryId,
        expectedAmount: targetAmount,
        walletAddress,
        tokenTicker: govTokenTicker,
        timestamp,
        status: 'failed',
        error: 'Verification timed out'
      });
      logger.warn({ primaryId: data.primaryId }, 'Transaction verification timed out');
    })();

    return {
      status: 'pending',
      message: 'Verification process started',
      retryAfter: 3,
      verificationId,
      expectedAmount: targetAmount,
      address: walletAddress,
      ticker: govTokenTicker
    };
  } catch (error) {
    logger.error({ error }, 'Error initiating verification process');
    throw error;
  }
};

export const getPrimaryCandidateVerification = async (primaryId: number, verificationId: string): Promise<VerificationResult> => {
  try {
    logger.info({ primaryId, verificationId }, 'Getting primary candidate verification status');

    const verification = verificationStore.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.primaryId !== primaryId) {
      throw new Error('Verification ID does not match primary ID');
    }

    if (verification.status === 'completed' && verification.transaction) {
      return {
        status: 'completed',
        transaction: verification.transaction
      };
    }

    if (verification.status === 'failed') {
      return {
        status: 'failed',
        error: verification.error || 'Unknown error'
      };
    }

    return {
      status: 'pending',
      message: 'Verification in progress'
    };
  } catch (error) {
    logger.error({ error }, 'Error getting verification status');
    throw error;
  }
};

export const createPrimaryCandidate = async (data: {
  name: string;
  description: string;
  twitter?: string | null;
  discord?: string | null;
  telegram?: string | null;
  type: number;
  status: number;
  primaryId: number;
  verificationId: string;
  walletAddress: string;
}): Promise<any> => {
  try {
    logger.info({ name: data.name, primaryId: data.primaryId }, 'Creating primary candidate');

    // Create the candidate
    const candidate = await prisma.election_candidates.create({
      data: {
        name: data.name,
        twitter: data.twitter,
        discord: data.discord,
        telegram: data.telegram,
        type: data.type,
        status: data.status,
        created: new Date(),
        data: Buffer.from(JSON.stringify({ description: data.description })),
        candidates_of_primaries: {
          connect: [{
            id: data.primaryId
          }]
        }
      },
      include: {
        candidates_of_primaries: true
      }
    });

    // Link the wallet to the candidate
    await prisma.candidate_wallets.update({
      where: {
        address: data.walletAddress
      },
      data: {
        candidate_id: candidate.id
      }
    });

    logger.debug({ candidateId: candidate.id }, 'Primary candidate created successfully');
    return candidate;
  } catch (error) {
    logger.error({ error, data }, 'Error creating primary candidate');
    throw new Error('Could not create primary candidate');
  }
};

export const nominateCandidate = async (
  primaryId: number,
  name: string,
  twitter: string | null,
  discord: string | null,
  telegram: string | null
): Promise<any> => {
  try {
    // Check if primary exists
    const primary = await prisma.election_primaries.findUnique({
      where: { id: primaryId },
      include: { primary_candidates: true }
    });

    if (!primary) {
      throw new Error('Primary election not found');
    }

    // Create new candidate
    const newCandidate = await prisma.election_candidates.create({
      data: {
        name,
        twitter,
        discord,
        telegram,
        created: new Date(),
        type: 1, // Default type
        status: 1, // Default status
        candidates_of_primaries: {
          connect: {
            id: primaryId
          }
        }
      }
    });

    return {
      success: true,
      candidate: newCandidate
    };
  } catch (error) {
    console.error('Error nominating candidate:', error);
    throw error;
  }
};
 