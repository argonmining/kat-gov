import { getTokenPrice } from '../services/kasplexAPI.js';
import { createModuleLogger } from './logger.js';
import { config } from '../config/env.js';

const logger = createModuleLogger('tokenCalcs');

/**
 * Calculate the quantity of tokens needed for proposal submission.
 * @returns The quantity of tokens required.
 */
export async function proposalSubmissionFee(): Promise<number> {
  try {
    logger.info('Calculating proposal submission fee');
    const proposalSubmissionFeeUSD = config.proposals.submissionFeeUsd;
    const govTokenTicker = config.tokens.govTokenTicker;
    
    logger.debug({ proposalSubmissionFeeUSD, govTokenTicker }, 'Fee calculation parameters');

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the configuration.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);
    logger.debug({ tokenPrice }, 'Retrieved token price');

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate proposal submission fee.');
    }

    const baseFee = proposalSubmissionFeeUSD / tokenPrice;
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;
    const fee = Math.floor(baseFee) + (baseFee % 1) * randomMultiplier;
    const finalFee = Math.floor(fee * 1e8) / 1e8;

    logger.info({ 
      baseFee,
      randomMultiplier,
      fee,
      finalFee
    }, 'Proposal submission fee calculated');

    return finalFee;
  } catch (error) {
    logger.error({ error }, 'Error calculating proposal submission fee');
    throw error;
  }
}

/**
 * Calculate the quantity of tokens needed for proposal nomination.
 * @returns The quantity of tokens required.
 */
export async function proposalNominationFee(): Promise<number> {
  try {
    logger.info('Calculating proposal nomination fee');
    const proposalNominationFeeUSD = config.proposals.nominationFeeUsd;
    const govTokenTicker = config.tokens.govTokenTicker;
    
    logger.debug({ proposalNominationFeeUSD, govTokenTicker }, 'Fee calculation parameters');

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the configuration.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);
    logger.debug({ tokenPrice }, 'Retrieved token price');

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate proposal nomination fee.');
    }

    const baseFee = proposalNominationFeeUSD / tokenPrice;
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;
    const fee = Math.floor(baseFee) + (baseFee % 1) * randomMultiplier;
    const finalFee = Math.floor(fee * 1e8) / 1e8;

    logger.info({ 
      baseFee,
      randomMultiplier,
      fee,
      finalFee
    }, 'Proposal nomination fee calculated');

    return finalFee;
  } catch (error) {
    logger.error({ error }, 'Error calculating proposal nomination fee');
    throw error;
  }
}

/**
 * Calculate the quantity of tokens needed for candidate nomination.
 * @returns The quantity of tokens required.
 */
export async function candidateNominationFee(): Promise<number> {
  try {
    logger.info('Calculating candidate nomination fee');
    const candidateNominationFeeUSD = config.candidates.nominationFeeUsd;
    const govTokenTicker = config.tokens.govTokenTicker;
    
    logger.debug({ candidateNominationFeeUSD, govTokenTicker }, 'Fee calculation parameters');

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the configuration.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);
    logger.debug({ tokenPrice }, 'Retrieved token price');

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate candidate nomination fee.');
    }

    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;
    const fee = (candidateNominationFeeUSD / tokenPrice) * randomMultiplier;
    const finalFee = Math.floor(fee * 1e8) / 1e8;

    logger.info({ 
      candidateNominationFeeUSD,
      tokenPrice,
      randomMultiplier,
      finalFee
    }, 'Candidate nomination fee calculated');

    return finalFee;
  } catch (error) {
    logger.error({ error }, 'Error calculating candidate nomination fee');
    throw error;
  }
}

/**
 * Calculate the proposal vote fee.
 * @param amount - The decimal number representing the amount.
 * @returns An object containing the calculated votes and the original amount.
 */
export function proposalVoteFee(amount: number): { votes: number, amount: number } {
  try {
    logger.info({ amount }, 'Calculating proposal vote fee');
    const proposalVotingFeeMin = config.proposals.votingFeeMin;
    const proposalVotingFeeMultiplier = config.proposals.votingFeeMultiplier;
    const proposalMaximumVotes = config.proposals.maximumVotes;

    logger.debug({
      proposalVotingFeeMin,
      proposalVotingFeeMultiplier,
      proposalMaximumVotes
    }, 'Vote fee parameters');

    if (amount <= proposalVotingFeeMin) {
      const error = new Error(`Amount must be greater than ${proposalVotingFeeMin}`);
      logger.error({ error, amount, proposalVotingFeeMin }, 'Invalid amount for vote fee calculation');
      throw error;
    }

    const calculatedVotes = amount * proposalVotingFeeMultiplier;
    const votes = Math.min(calculatedVotes, proposalMaximumVotes);

    logger.info({ 
      calculatedVotes,
      votes,
      amount 
    }, 'Proposal vote fee calculated');

    return { votes, amount };
  } catch (error) {
    logger.error({ error }, 'Error calculating proposal vote fee');
    throw error;
  }
}
