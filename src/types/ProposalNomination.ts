export interface ProposalNomination {
  id: number;
  proposalId: number;
  nominatedAt: Date;
  hash: string;
  toAddress: string;
  amountSent: number;
  validVote: boolean;
} 