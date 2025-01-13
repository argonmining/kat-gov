import { getTokenPrice } from '../services/kasplexAPI.js';
import { createModuleLogger } from './logger.js';
import { config } from '../config/env.js';

const logger = createModuleLogger('tokenCalcs');

/**
 * Calculate the quantity of tokens needed for proposal submission.
 * Converts the configured USD fee to token amount based on current token price.
 * Applies a random multiplier between 0.95 and 1.10 to prevent front-running.
 * 
 * @throws {Error} If GOV_TOKEN_TICKER is not configured
 * @throws {Error} If token price is zero
 * @returns {Promise<number>} The quantity of tokens required, with 8 decimal places precision
 */
export async function proposalEditFee(): Promise<number> {
  try {
    logger.info('Calculating proposal submission fee');
    const proposaleditFeeUsd = config.proposals.editFeeUsd;
    const govTokenTicker = config.tokens.govTokenTicker;
    
    logger.debug({ proposaleditFeeUsd, govTokenTicker }, 'Fee calculation parameters');

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the configuration.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);
    logger.debug({ tokenPrice }, 'Retrieved token price');

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate proposal edit fee.');
    }

    const baseFee = proposaleditFeeUsd / tokenPrice;
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;
    const fee = Math.floor(baseFee) + (baseFee % 1) * randomMultiplier;
    const finalFee = Math.floor(fee * 1e8) / 1e8;

    logger.info({ 
      baseFee,
      randomMultiplier,
      fee,
      finalFee
    }, 'Proposal edit fee calculated');

    return finalFee;
  } catch (error) {
    logger.error({ error }, 'Error calculating proposal edit fee');
    throw error;
  }
}

/**
 * Calculate the quantity of tokens needed for proposal nomination.
 * Converts the configured USD fee to token amount based on current token price.
 * Applies a random multiplier between 0.95 and 1.10 to prevent front-running.
 * 
 * @throws {Error} If GOV_TOKEN_TICKER is not configured
 * @throws {Error} If token price is zero
 * @returns {Promise<number>} The quantity of tokens required, with 8 decimal places precision
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
 * Converts the configured USD fee to token amount based on current token price.
 * Applies a random multiplier between 0.95 and 1.10 to prevent front-running.
 * 
 * @throws {Error} If GOV_TOKEN_TICKER is not configured
 * @throws {Error} If token price is zero
 * @returns {Promise<number>} The quantity of tokens required, with 8 decimal places precision
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
 * Calculate the voting power (number of votes) based on the amount of tokens provided.
 * The voting power scales linearly between the minimum and maximum fee thresholds.
 * Amounts above the maximum fee threshold are accepted but capped at the maximum voting power.
 * 
 * @param {number} amount - The amount of tokens being used to vote
 * @returns {{ votes: number, amount: number }} Object containing:
 *   - votes: The calculated voting power (capped at maximumVotes)
 *   - amount: The original amount provided
 * @throws {Error} If amount is less than or equal to the minimum voting fee
 * 
 * @example
 * // Calculate votes for 1000 tokens
 * const result = proposalVoteFee(1000);
 * console.log(result.votes); // Number of votes granted
 * console.log(result.amount); // Original 1000 tokens
 */
export function proposalVoteFee(amount: number): { votes: number, amount: number } {
  try {
    logger.info({ amount }, 'Calculating proposal vote fee');
    const proposalVotingFeeMin = config.proposals.votingFeeMin;
    const proposalVotingFeeMax = config.proposals.votingFeeMax;
    const proposalMaximumVotes = config.proposals.maximumVotes;

    logger.debug({
      proposalVotingFeeMin,
      proposalVotingFeeMax,
      proposalMaximumVotes
    }, 'Vote fee parameters');

    if (amount <= proposalVotingFeeMin) {
      const error = new Error(`Amount must be greater than ${proposalVotingFeeMin}`);
      logger.error({ error, amount, proposalVotingFeeMin }, 'Invalid amount for vote fee calculation');
      throw error;
    }

    // Calculate votes based on amount, scaling linearly between min and max
    const effectiveAmount = Math.min(amount, proposalVotingFeeMax);
    const votingRange = proposalVotingFeeMax - proposalVotingFeeMin;
    const amountAboveMin = effectiveAmount - proposalVotingFeeMin;
    const votingRatio = amountAboveMin / votingRange;
    const calculatedVotes = Math.floor(proposalMaximumVotes * votingRatio);
    const votes = Math.min(calculatedVotes, proposalMaximumVotes);

    logger.info({ 
      effectiveAmount,
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

export async function validateVoteAmount(address: string, amount: number, snapshotData: any): Promise<boolean> {
  try {
    // Find the holder's balance in the snapshot
    const holder = snapshotData.holders.find((h: { address: string }) => 
      h.address.toLowerCase() === address.toLowerCase()
    );

    if (!holder) {
      logger.warn({ address }, 'Address not found in snapshot');
      return false;
    }

    // Convert balance from string to number (assuming balance is in the smallest unit)
    const balance = BigInt(holder.balance);
    const voteAmount = BigInt(amount);

    // Validate that the vote amount is not greater than their balance at snapshot time
    const isValid = voteAmount <= balance;
    
    if (!isValid) {
      logger.warn({ 
        address, 
        balance: balance.toString(), 
        voteAmount: voteAmount.toString() 
      }, 'Vote amount exceeds snapshot balance');
    }

    return isValid;
  } catch (error) {
    logger.error({ error, address, amount }, 'Error validating vote amount');
    return false;
  }
}
