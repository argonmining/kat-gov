// src/types/ProposalVote.ts

export interface ProposalVote {
  id: number; // Primary key
  amt: number; // Amount of the vote
  hash: string; // Unique hash for the vote
  approve: boolean; // Whether the vote is an approval
  valid: boolean; // Whether the vote is valid
  proposal: number; // Foreign key referencing proposals.id
  submitdate: string; // ISO 8601 formatted date string
}

