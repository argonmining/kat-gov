export interface Election {
  id: number;
  title: string;
  description: string;
  reviewed: boolean;
  approved: boolean;
  votesActive: boolean;
  openVote: Date;
  closeVote: Date;
  created: Date;
}

export interface ElectionCandidate {
  id: number;
  name: string;
  twitter: string;
  discord: string;
  telegram: string;
  created: Date;
  data: Record<string, any>;
}

export interface ElectionPosition {
  id: number;
  title: string;
  description: string;
}

export interface ElectionStatus {
  id: number;
  name: string;
  active: boolean;
}

export interface ElectionType {
  id: number;
  name: string;
  active: boolean;
}

export interface ElectionPrimary {
  id: number;
  electionId: number;
  candidateId: number;
  votes: number;
  created: Date;
}

export interface ElectionSnapshot {
  id: number;
  electionId: number;
  data: Record<string, any>;
  created: Date;
} 