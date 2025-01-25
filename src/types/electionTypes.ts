import { Decimal } from '@prisma/client/runtime/library';
import { CandidateVote } from './candidateTypes.js';

// Core election types
export interface Election {
  id: number;
  title: string;
  description: string;
  reviewed: boolean;
  approved: boolean;
  votesactive: boolean;
  openvote: Date | null;
  closevote: Date | null;
  created: Date;
  type: number;
  position: number;
  firstcandidate: number | null;
  secondcandidate: number | null;
  status: number;
  snapshot: number | null;
}

// Primary election type
export interface PrimaryElection {
  id: number;
  title: string;
  description: string;
  type: number;
  position: number;
  status: number;
  reviewed: boolean;
  approved: boolean;
  votesactive: boolean;
  openvote: Date | null;
  closevote: Date | null;
  created: Date;
  snapshot: number | null;
  parent_election_id: number;
  candidates: ElectionCandidate[];
  election: {
    id: number;
    title: string;
    description: string;
    reviewed: boolean;
    approved: boolean;
    votesactive: boolean;
    openvote: string | null;
    closevote: string | null;
    created: string;
    type: number;
    position: number;
    status: number;
    snapshot: number | null;
    wallet: string | null;
  };
}

// Election candidate types
export interface ElectionCandidate {
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

export interface ElectionPosition {
  id: number;
  title: string;
  description: string;
  created: Date;
}

export interface ElectionStatus {
  id: number;
  name: string;
  active: boolean;
}

export interface ElectionType {
  id: number;
  name: string;
  active: boolean;
}

// Election voting types
export interface ElectionVote {
  id: number;
  election_id: number;
  candidate_id: number;
  toaddress: string;
  amountsent: Decimal;
  created: Date;
  validvote: boolean;
  votescounted: number;
  election_snapshot_id?: number;
}

// Election snapshot types
export interface ElectionSnapshot {
  id: number;
  generated: Date;
  data: any;
  proposal_id: number | null;
}

// Re-export CandidateVote for backward compatibility
export { CandidateVote }; 