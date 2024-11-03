export interface ElectionCandidate {
  id: number;
  name: string;
  twitter: string;
  discord: string;
  telegram: string;
  created: Date;
  data: Buffer; // Assuming this is a binary field
} 