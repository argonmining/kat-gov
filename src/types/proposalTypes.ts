import { Decimal } from '@prisma/client/runtime/library';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  body?: string;
  type?: number;
  approved?: boolean;
  reviewed?: boolean;
  status?: number;
  submitted: Date;
  openvote?: Date;
  closevote?: Date;
  snapshot?: string;
  amount?: string;
  percentage?: string;
  details?: string;
  votesactive?: boolean;
  votesActive?: boolean;
  passed?: boolean;
  wallet?: number;
  proposal_wallets_proposals_walletToproposal_wallets?: {
    id?: number;
    address: string;
    encryptedprivatekey?: string;
    balance?: Decimal;
    timestamp?: Date;
    active?: boolean;
    proposal_id?: number;
  } | null;
  proposal_statuses?: {
    id: number;
    name: string;
    active: boolean;
  };
  proposal_types?: {
    id: number;
    name: string;
    simplevote: boolean;
  };
}

export interface ProposalType {
  id: number;
  name: string;
  simple: boolean;
  simplevote?: boolean;
  active?: boolean;
}

export interface ProposalStatus {
  id: number;
  name: string;
  active: boolean;
}

export interface ProposalVote {
  id: number;
  created?: Date;
  hash?: string;
  toaddress: string;
  amountsent: Decimal;
  votescounted: number;
  validvote: boolean;
  proposal_id: number;
  proposal_snapshot_id?: number;
}

export interface ProposalYesVote extends ProposalVote {
  // Additional fields specific to yes votes if needed
}

export interface ProposalNoVote extends ProposalVote {
  // Additional fields specific to no votes if needed
}

export interface ProposalNomination {
  id: number;
  created?: Date;
  hash?: string;
  toaddress?: string;
  amountsent?: Decimal;
  validvote?: boolean;
  proposal_id?: number;
}

export interface ProposalSnapshot {
  id: number;
  generated?: Date;
  data?: any;
  proposal_id?: number;
}

export interface ProposalWallet {
  id: number;
  address?: string;
  encryptedprivatekey?: string;
  balance?: Decimal;
  timestamp?: Date;
  active?: boolean;
  proposal_id?: number;
} 