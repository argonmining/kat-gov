/**
 * @swagger
 * components:
 *   schemas:
 *     Proposal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The proposal's unique identifier
 *         title:
 *           type: string
 *           description: The title of the proposal
 *         description:
 *           type: string
 *           description: A brief description of the proposal
 *         body:
 *           type: string
 *           description: The full content of the proposal
 *         type:
 *           type: integer
 *           description: The type ID of the proposal
 *         submitted:
 *           type: string
 *           format: date-time
 *           description: When the proposal was submitted
 *         reviewed:
 *           type: boolean
 *           description: Whether the proposal has been reviewed
 *         approved:
 *           type: boolean
 *           description: Whether the proposal has been approved
 *         passed:
 *           type: boolean
 *           description: Whether the proposal has passed
 *         votesactive:
 *           type: boolean
 *           description: Whether voting is currently active
 *         status:
 *           type: integer
 *           description: The current status ID of the proposal
 *         wallet:
 *           type: integer
 *           description: The associated wallet ID
 *
 *     ProposalVote:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The vote's unique identifier
 *         proposal_id:
 *           type: integer
 *           description: The ID of the proposal being voted on
 *         toaddress:
 *           type: string
 *           description: The address that received the vote tokens
 *         amountsent:
 *           type: string
 *           description: The amount of tokens sent for the vote
 *         votescounted:
 *           type: integer
 *           description: The number of votes counted
 *         validvote:
 *           type: boolean
 *           description: Whether the vote is valid
 *         proposal_snapshot_id:
 *           type: integer
 *           description: The ID of the associated proposal snapshot
 *
 *     ProposalType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The type's unique identifier
 *         name:
 *           type: string
 *           description: The name of the proposal type
 *         simple:
 *           type: boolean
 *           description: Whether this is a simple vote type
 *
 *     ProposalStatus:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The status's unique identifier
 *         name:
 *           type: string
 *           description: The name of the status
 *         active:
 *           type: boolean
 *           description: Whether this status is active
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *
 *     Config:
 *       type: object
 *       properties:
 *         govTokenTicker:
 *           type: string
 *           description: The governance token ticker symbol
 *         proposals:
 *           type: object
 *           properties:
 *             editFeeUsd:
 *               type: number
 *               description: The fee in USD for submitting a proposal
 *             nominationFeeUsd:
 *               type: number
 *               description: The fee in USD for nominating a proposal
 *             votingFeeMin:
 *               type: number
 *               description: The minimum fee for voting
 *             votingFeeMax:
 *               type: number
 *               description: The maximum fee for voting
 *         candidates:
 *           type: object
 *           properties:
 *             nominationFeeUsd:
 *               type: number
 *               description: The fee in USD for nominating a candidate
 *         addresses:
 *           type: object
 *           properties:
 *             gov:
 *               type: string
 *               description: The governance contract address
 *             yes:
 *               type: string
 *               description: The yes vote contract address
 *             no:
 *               type: string
 *               description: The no vote contract address
 */

// Export type definitions that match the Swagger schemas
export interface SwaggerProposal {
  id: number;
  title: string;
  description?: string;
  body?: string;
  type?: number;
  submitted: Date;
  reviewed: boolean;
  approved: boolean;
  passed: boolean;
  votesactive: boolean;
  status: number;
  wallet?: number;
}

export interface SwaggerProposalVote {
  id: number;
  proposal_id: number;
  toaddress: string;
  amountsent: string;
  votescounted: number;
  validvote: boolean;
  proposal_snapshot_id?: number;
}

export interface SwaggerProposalType {
  id: number;
  name: string;
  simple: boolean;
}

export interface SwaggerProposalStatus {
  id: number;
  name: string;
  active: boolean;
}

export interface SwaggerConfig {
  govTokenTicker: string;
  proposals: {
    editFeeUsd: number;
    nominationFeeUsd: number;
    votingFeeMin: number;
    votingFeeMax: number;
  };
  candidates: {
    nominationFeeUsd: number;
  };
  addresses: {
    gov: string;
    yes: string;
    no: string;
  };
} 