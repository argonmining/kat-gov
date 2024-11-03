export interface ProposalSnapshot {
  id: number;
  proposalId: number;
  generated: Date;
  data: any; // Use a more specific type if possible
} 