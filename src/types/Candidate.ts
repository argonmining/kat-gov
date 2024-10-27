// src/types/Candidate.ts

export interface Candidate {
  id: number; // Primary key
  name: string; // Name of the candidate
  position: number; // Foreign key referencing positions.id
  election: number; // Foreign key referencing elections.id
}

