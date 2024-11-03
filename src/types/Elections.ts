export interface Election {
  id: number; // Primary key
  title: string; // Title of the election
  description: string; // Description of the election
  reviewed: boolean; // Whether the election is reviewed
  approved: boolean; // Whether the election is approved
  votesActive: boolean; // Whether votes are active
  openVote: Date; // Date when voting opens
  closeVote: Date; // Date when voting closes
  created: Date; // Date of creation
} 