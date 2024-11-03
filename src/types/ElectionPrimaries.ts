export interface ElectionPrimary {
  id: number; // Primary key
  type: number; // Foreign key referencing election_types.id
  position: number; // Foreign key referencing election_positions.id
  candidates: number; // Foreign key referencing election_candidates.id
  status: number; // Foreign key referencing election_statuses.id
  snapshot: number; // Foreign key referencing election_snapshots.id
} 