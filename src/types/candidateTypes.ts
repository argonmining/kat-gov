export interface CandidateVote {
  id: number;
  candidateId: number;
  walletAddress: string;
  voteAmount: number;
  created: Date;
}

export interface CandidateNomination {
  id: number;
  candidateId: number;
  walletAddress: string;
  nominationAmount: number;
  created: Date;
}

export interface CandidateWallet {
  id: number;
  address: string;
  encryptedPrivateKey: string;
}

export interface CandidateStatus {
  id: number;
  name: string;
  active: boolean;
} 