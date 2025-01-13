import { Decimal } from '@prisma/client/runtime/library';

// Core candidate types
export interface Candidate {
  id: number;
  name: string;
  twitter: string | null;
  discord: string | null;
  telegram: string | null;
  created: Date;
  data: Buffer | null;
  type: number | null;
  status: number | null;
  wallet: number | null;
  nominations: number | null;
}

export interface CandidateStatus {
  id: number;
  name: string;
  active: boolean;
}

// Candidate voting types
export interface CandidateVote {
  id: number;
  created: Date;
  hash: string | null;
  toaddress: string;
  amountsent: Decimal;
  votescounted: number | null;
  validvote: boolean;
  candidate_id: number;
  election_snapshot_id: number | null;
}

// Candidate nomination types
export interface CandidateNomination {
  id: number;
  created: Date;
  hash: string | null;
  toaddress: string;
  amountsent: Decimal;
  validvote: boolean;
  candidate_id: number;
}

// Candidate wallet types
export interface CandidateWallet {
  id: number;
  address: string;
  balance: Decimal;
  created: Date;
  active: boolean;
  candidate_id: number | null;
}

// Request/Response types
export interface CandidateNominationFeeResponse {
  nominationFeeUsd: number;
} 