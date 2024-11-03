export interface Proposal {
  id: number; // Primary key
  title: string; // Title of the proposal
  description: string; // Description of the proposal
  body: string; // Body of the proposal
  type: number; // Foreign key referencing proposal_types.id
  submitted: Date; // Date of submission
  reviewed: boolean; // Whether the proposal is reviewed
  approved: boolean; // Whether the proposal is approved
  passed: boolean; // Whether the proposal passed
  votesActive: boolean; // Whether votes are active
  openVote: Date; // Date when voting opens
  closeVote: Date; // Date when voting closes
} 