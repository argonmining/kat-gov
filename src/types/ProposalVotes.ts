export interface ProposalVote {
  id: number; // Primary key
  amountSent: number; // Amount sent in the vote
  hash: string; // Unique hash for the vote
  toAddress: string; // Address to which the vote is sent
  votesCounted: boolean; // Whether the votes are counted
  validVote: boolean; // Whether the vote is valid
  proposal_id: number; // Foreign key referencing proposals.id
  created: Date; // Date of creation
} 