import { prisma } from '../config/prisma.js';
import { createModuleLogger } from '../utils/logger.js';
import {
  CandidateNomination,
  CandidateWallet,
  CandidateStatus
} from '../types/candidateTypes.js';
import { CandidateVote } from '../types/electionTypes.js';
import { Decimal } from '@prisma/client/runtime/library';

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
    const result = await prisma.candidate_wallets.findMany();
    logger.debug({ count: result.length }, 'Retrieved all candidate wallets');
    return result as unknown as CandidateWallet[];
  } catch (error) {
    logger.error({ error }, 'Error fetching candidate wallets');
    throw new Error('Could not fetch candidate wallets');
  }
};

export const createCandidateWallet = async (address: string, encryptedPrivateKey: string): Promise<CandidateWallet> => {
  try {
    logger.info({ address }, 'Creating candidate wallet');
    const result = await prisma.candidate_wallets.create({
      data: {
        address,
        encryptedprivatekey: encryptedPrivateKey,
        active: true,
        created: new Date(),
        balance: new Decimal('0')
      }
    });
    logger.debug({ id: result.id }, 'Candidate wallet created successfully');
    return result as unknown as CandidateWallet;
  } catch (error) {
    logger.error({ error, address }, 'Error creating candidate wallet');
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
 