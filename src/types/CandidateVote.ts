export interface CandidateVote {
  id: number; // Primary key
  amountSent: number; // Amount sent in the vote
  candidate_id: number; // Foreign key referencing election_candidates.id
  hash: string; // Unique hash for the vote
  toAddress: string; // Address to which the vote is sent
  votesCounted: boolean; // Whether the votes are counted
  validVote: boolean; // Whether the vote is valid
  created: Date; // Date of creation
} 