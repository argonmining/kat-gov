// Token holder types
export interface TokenHolder {
  address: string;
  balance: number;
  locked: number;
  share: number;
}

// Snapshot data types
export interface SnapshotSummary {
  totalSupply: number;
  holdersCount: number;
  lockedTokens: number;
  circulatingSupply: number;
}

export interface SnapshotData {
  tick: string;
  timestamp: number;
  holders: TokenHolder[];
  summary: SnapshotSummary;
}

// API types
export interface SnapshotResponse {
  success: boolean;
  data: SnapshotData;
}

// Request/Response types
export interface CreateSnapshotRequest {
  entityType: 'proposal' | 'election';
  entityId: number;
} 