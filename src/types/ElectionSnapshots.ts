export interface ElectionSnapshot {
  id: number; // Primary key
  election_id: number; // Foreign key referencing elections.id
  snapshot_data: string; // Data of the snapshot
  created: Date; // Date of creation
} 