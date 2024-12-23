import { Decimal } from '@prisma/client/runtime/library';

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
  active: boolean;
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

export interface ElectionSnapshot {
  id: number;
  generated: Date;
  data: any;
  proposal_id: number | null;
}

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