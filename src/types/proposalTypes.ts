export interface Proposal {
  id: number;
  title: string;
  description: string;
  reviewed: boolean;
  approved: boolean;
  passed: boolean;
  votesActive: boolean;
  status: number;
  wallet: number;
  submitted: Date;
}

export interface ProposalVote {
  id: number;
  proposalId: number;
  walletAddress: string;
  voteAmount: number;
  created: Date;
}

export interface ProposalYesVote {
  id: number;
  proposalId: number;
  walletAddress: string;
  voteAmount: number;
  created: Date;
}

export interface ProposalNoVote {
  id: number;
  proposalId: number;
  walletAddress: string;
  voteAmount: number;
  created: Date;
}

export interface ProposalNomination {
  id: number;
  proposalId: number;
  walletAddress: string;
  nominationAmount: number;
  created: Date;
}

export interface ProposalSnapshot {
  id: number;
  proposalId: number;
  data: Record<string, any>;
  created: Date;
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

export interface ProposalWallet {
  id: number;
  address: string;
  encryptedPrivateKey: string;
} 