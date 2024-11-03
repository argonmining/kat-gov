export interface ProposalNoVote {
  id: number;
  created: Date;
  hash: string;
  toAddress: string;
  amountSent: number;
  votesCounted: number;
  validVote: boolean;
} 