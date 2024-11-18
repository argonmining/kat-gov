import { getTokenPrice } from '../services/kasplexAPI.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Calculate the quantity of tokens needed for proposal submission.
 * @returns The quantity of tokens required.
 */
export async function proposalSubmissionFee(): Promise<number> {
  try {
    const proposalSubmissionFeeUSD = parseFloat(process.env.PROPOSAL_SUBMISSION_FEE_USD || '0');
    const govTokenTicker = process.env.GOV_TOKEN_TICKER || '';

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the environment variables.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate proposal submission fee.');
    }

    // Generate a random multiplier between 0.95 and 1.10
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;

    // Calculate the fee and truncate to a maximum of 8 decimals
    const fee = (proposalSubmissionFeeUSD / tokenPrice) * randomMultiplier;
    return Math.floor(fee * 1e8) / 1e8;
  } catch (error) {
    console.error('Error calculating proposal submission fee:', error);
    throw error;
  }
}

/**
 * Calculate the quantity of tokens needed for proposal nomination.
 * @returns The quantity of tokens required.
 */
export async function proposalNominationFee(): Promise<number> {
  try {
    const proposalNominationFeeUSD = parseFloat(process.env.PROPOSAL_NOMINATION_FEE_USD || '0');
    const govTokenTicker = process.env.GOV_TOKEN_TICKER || '';

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the environment variables.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate proposal nomination fee.');
    }

    // Generate a random multiplier between 0.95 and 1.10
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;

    // Calculate the fee and truncate to a maximum of 8 decimals
    const fee = (proposalNominationFeeUSD / tokenPrice) * randomMultiplier;
    return Math.floor(fee * 1e8) / 1e8;
  } catch (error) {
    console.error('Error calculating proposal nomination fee:', error);
    throw error;
  }
}

/**
 * Calculate the quantity of tokens needed for candidate nomination.
 * @returns The quantity of tokens required.
 */
export async function candidateNominationFee(): Promise<number> {
  try {
    const candidateNominationFeeUSD = parseFloat(process.env.CANDIDATE_NOMINATION_FEE_USD || '0');
    const govTokenTicker = process.env.GOV_TOKEN_TICKER || '';

    if (!govTokenTicker) {
      throw new Error('GOV_TOKEN_TICKER is not defined in the environment variables.');
    }

    const tokenPrice = await getTokenPrice(govTokenTicker);

    if (tokenPrice === 0) {
      throw new Error('Token price is zero, cannot calculate candidate nomination fee.');
    }

    // Generate a random multiplier between 0.95 and 1.10
    const randomMultiplier = Math.random() * (1.10 - 0.95) + 0.95;

    // Calculate the fee and truncate to a maximum of 8 decimals
    const fee = (candidateNominationFeeUSD / tokenPrice) * randomMultiplier;
    return Math.floor(fee * 1e8) / 1e8;
  } catch (error) {
    console.error('Error calculating candidate nomination fee:', error);
    throw error;
  }
}

/**
 * Calculate the proposal vote fee.
 * @param amount - The decimal number representing the amount.
 * @returns An object containing the calculated votes and the original amount.
 */
export function proposalVoteFee(amount: number): { votes: number, amount: number } {
  const proposalVotingFeeMin = parseFloat(process.env.PROPOSAL_VOTING_FEE_MIN || '0');
  const proposalVotingFeeMultiplier = parseFloat(process.env.PROPOSAL_VOTING_FEE_MULTIPLIER || '1');
  const proposalMaximumVotes = parseFloat(process.env.PROPOSAL_MAXIMUM_VOTES || '0');

  if (amount <= proposalVotingFeeMin) {
    throw new Error(`Amount must be greater than ${proposalVotingFeeMin}`);
  }

  const calculatedVotes = amount * proposalVotingFeeMultiplier;
  const votes = Math.min(calculatedVotes, proposalMaximumVotes);

  return { votes, amount };
}
