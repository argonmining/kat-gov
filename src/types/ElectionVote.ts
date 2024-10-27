// src/types/ElectionVote.ts

export interface ElectionVote {
  id: number; // Primary key
  amt: number; // Amount of the vote
  candidate: number; // Foreign key referencing candidates.id
  position: number; // Foreign key referencing positions.id
  election: number; // Foreign key referencing elections.id
  valid: boolean; // Whether the vote is valid
  hash: string; // Unique hash for the vote
  submitdate: string; // ISO 8601 formatted date string
}

