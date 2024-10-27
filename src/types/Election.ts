// src/types/Election.ts

export interface Election {
  id: number; // Primary key
  title: string; // Title of the election
  position: number; // Foreign key referencing positions.id
  status: number; // Foreign key referencing statuses.id
  submitdate: string; // ISO 8601 formatted date string
  openvote: string; // ISO 8601 formatted date string
  snapshot: string; // ISO 8601 formatted date string
  closevote: string; // ISO 8601 formatted date string
  winner: number | null; // Foreign key referencing candidates.id, nullable
}

