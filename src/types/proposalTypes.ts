import { Decimal } from '@prisma/client/runtime/library';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  submitted: Date;
  reviewed: boolean;
  approved: boolean;
  passed: boolean;
  votesactive: boolean;
  status: number;
  wallet: number;
}

export interface ProposalVote {
  id: number;
  proposal_id: number;
  toaddress: string;
  amountsent: Decimal;
  votescounted: number | null;
  validvote: boolean;
  proposal_snapshot_id: number | null;
  isYesVote?: boolean;
}

export interface ProposalYesVote extends ProposalVote {
  // Additional fields specific to yes votes if needed
}

export interface ProposalNoVote extends ProposalVote {
  // Additional fields specific to no votes if needed
}

export interface ProposalNomination {
  id: number;
  proposal_id: number;
  toaddress: string;
  amountsent: Decimal;
  hash: string | null;
  created: Date;
  validvote: boolean;
}

export interface ProposalWallet {
  id: number;
  address: string;
  encryptedprivatekey: string;
  balance: Decimal;
  created: Date;
  active: boolean;
  proposal_id: number | null;
}

export interface ProposalType {
  id: number;
  name: string;
  active: boolean;
}

export interface ProposalStatus {
  id: number;
  name: string;
  active: boolean;
}

export interface ProposalSnapshot {
  id: number;
  proposal_id: number;
  data: Record<string, any>;
  created: Date;
} 