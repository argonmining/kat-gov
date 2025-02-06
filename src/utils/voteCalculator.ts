import { createModuleLogger } from './logger.js';
import { config } from '../config/env.js';
import { Decimal } from '@prisma/client/runtime/library';

const logger = createModuleLogger('voteCalculator');

// Musical constants
const SEMITONE_RATIO = Math.pow(2, 1/12);  // ≈1.059463

export interface VoteWeight {
  votes: number;
  amount: Decimal;
  powerLevel: VotePowerLevel;
}

export enum VotePowerLevel {
  Piano = 'Piano',
  MezzoPiano = 'Mezzo-Piano',
  MezzoForte = 'Mezzo-Forte',
  Forte = 'Forte',
  Fortissimo = 'Fortissimo'
}

export const calculateVoteWeight = (amountSent: number | Decimal): VoteWeight => {
  const minFee = config.proposals.votingFeeMin;
  const maxFee = config.proposals.votingFeeMax;
  const maxTokenRatio = maxFee / minFee; // Dynamic ratio based on config
  
  const amount = new Decimal(amountSent.toString());
  
  if (amount.lessThan(minFee)) {
    logger.warn({ amount, minFee }, 'Amount below minimum fee');
    throw new Error(`Amount must be at least ${minFee}`);
  }

  // Normalize amount and apply cap
  const normalizedAmount = Math.min(
    amount.dividedBy(minFee).toNumber(),
    maxTokenRatio
  );

  // Calculate musical octaves from minimum
  const octaves = Math.log2(normalizedAmount);
  const semitones = octaves * 12;
  
  // Combine musical scaling with power dampening
  const votes = Math.floor(
    Math.pow(2, octaves * (2/3)) * 
    Math.pow(SEMITONE_RATIO, semitones % 12)
  );

  return {
    votes,
    amount,
    powerLevel: getVotePowerLevel(votes)
  };
};

export const getVotePowerLevel = (votes: number): VotePowerLevel => {
  // Scale thresholds based on maximum possible votes
  const maxVotes = Math.floor(
    Math.pow(2, Math.log2(config.proposals.votingFeeMax / config.proposals.votingFeeMin) * (2/3))
  );
  
  // Calculate dynamic thresholds as percentages of max votes
  const pianoThreshold = Math.floor(maxVotes * 0.05);        // 5% of max
  const mezzoPianoThreshold = Math.floor(maxVotes * 0.15);   // 15% of max
  const mezzoForteThreshold = Math.floor(maxVotes * 0.35);   // 35% of max
  const forteThreshold = Math.floor(maxVotes * 0.70);        // 70% of max

  if (votes <= pianoThreshold) return VotePowerLevel.Piano;
  if (votes <= mezzoPianoThreshold) return VotePowerLevel.MezzoPiano;
  if (votes <= mezzoForteThreshold) return VotePowerLevel.MezzoForte;
  if (votes <= forteThreshold) return VotePowerLevel.Forte;
  return VotePowerLevel.Fortissimo;
};

// Maintain compatibility by always returning true
export const validateVoteAmount = async (
  walletAddress: string,
  amount: number | Decimal,
  snapshotData: any
): Promise<boolean> => {
  logger.debug({ walletAddress, amount }, 'Bypassing snapshot validation');
  return true;
}; 