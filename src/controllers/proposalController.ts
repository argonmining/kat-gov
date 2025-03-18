import { Router, Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createProposal,
  getAllProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  createProposalWallet,
  createProposalVote,
  getVotesForProposal,
  createProposalYesVote,
  getAllProposalYesVotes,
  createProposalNoVote,
  getAllProposalNoVotes,
  createProposalNomination,
  getAllProposalNominations,
  updateProposalNomination,
  deleteProposalNomination,
  getAllProposalTypes,
  createProposalType,
  updateProposalType,
  deleteProposalType,
  getAllProposalStatuses,
  createProposalStatus,
  updateProposalStatus,
  deleteProposalStatus,
  getNominationsForProposal,
  countActiveProposals,
  countNominationsForProposal
} from '../models/proposalModels.js';
import {
  Proposal,
  ProposalVote,
  ProposalYesVote,
  ProposalNoVote,
  ProposalNomination,
  ProposalType,
  ProposalStatus,
  ProposalWallet
} from '../types/proposalTypes.js';
import { proposalEditFee, proposalNominationFee } from '../utils/tokenCalcs.js';
import { createKaspaWallet } from '../utils/walletUtils.js';
import { calculateVoteWeight } from '../utils/voteCalculator.js';
import { config, GOV_ADDRESS, YES_ADDRESS, NO_ADDRESS, GOV_TOKEN_TICKER } from '../config/env.js';
import { getKRC20OperationList, getKRC20OperationDetails } from '../services/kasplexAPI.js';
import { prisma } from '../config/prisma.js';
import { withErrorHandling, withDirectErrorHandling } from '../utils/errorHandler.js';

interface KRC20Operation {
  p: string;
  op: string;
  tick: string;
  amt: string;
  from: string;
  to: string;
  opScore: string;
  hashRev: string;
  feeRev: string;
  txAccept: string;
  opAccept: string;
  opError: string;
  checkpoint: string;
  mtsAdd: string;
  mtsMod: string;
}

const logger = createModuleLogger('proposalController');

// Raw handler implementations without try/catch blocks
// ==================================================================================

// Example of refactoring for submitProposal
const _submitProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const proposalData = req.body;
  logger.info({ proposalData }, 'Submitting proposal');
  
  // First create a new Kaspa wallet if one wasn't provided
  let wallet;
  if (!proposalData.wallet) {
    const { address, encryptedPrivateKey } = await createKaspaWallet();
    wallet = await createProposalWallet(address, encryptedPrivateKey);
  }
  
  // Now create the proposal with all the frontend data plus the new wallet
  const newProposal = await createProposal({
    title: proposalData.title,
    description: proposalData.description || '',
    body: proposalData.body || '',
    type: proposalData.type || null,
    submitted: new Date(),
    reviewed: false,
    approved: false,
    passed: false,
    votesactive: false,
    status: proposalData.status || 1, // Default to draft status if not provided
    wallet: wallet?.id || proposalData.wallet
  });

  // Fetch the complete proposal with related data
  const completeProposal = await getProposalById(newProposal.id);
  
  logger.info({ proposalId: newProposal.id }, 'Proposal submitted successfully');
  res.status(201).json(completeProposal);
};

// Example of refactoring for fetchAllProposals
const _fetchAllProposals = async (req: Request, res: Response): Promise<void> => {
  const {
    status,
    title,
    sort = 'submitted',
    limit = 100,
    offset = 0
  } = req.query;

  logger.info({ 
    query: req.query,
    url: req.url,
    method: req.method
  }, 'Incoming proposal fetch request');

  // Get status ID if status name is provided
  let statusId: number | undefined;
  if (status) {
    const statuses = await getAllProposalStatuses();
    const statusObj = statuses.find(s => s.name.toLowerCase() === (status as string).toLowerCase());
    if (statusObj) {
      statusId = statusObj.id;
    }
  }

  const proposals = await getAllProposals({
    title: title as string,
    status: statusId,
    sort: sort as string,
    limit: Number(limit),
    offset: Number(offset)
  });

  res.status(200).json(proposals);
};

// Example of refactoring for modifyProposal
const _modifyProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    body: req.body.body,
    type: req.body.type,
    status: req.body.status,
    reviewed: req.body.reviewed,
    approved: req.body.approved,
    passed: req.body.passed,
    votesactive: req.body.votesActive,
    openvote: req.body.openvote,
    closevote: req.body.closevote
  };

  logger.info({ proposalId, updates: updateData }, 'Modifying proposal');
  const updatedProposal = await updateProposal(proposalId, updateData);
  
  if (updatedProposal) {
    // Fetch fresh data with all relations
    const completeProposal = await getProposalById(proposalId);
    logger.info({ proposalId, dates: { openvote: updateData.openvote, closevote: updateData.closevote } }, 'Proposal updated successfully');
    res.status(200).json(completeProposal);
  } else {
    logger.warn({ proposalId }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
  }
};

// Example of refactoring for fetchProposalById
const _fetchProposalById = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId }, 'Fetching proposal by ID');
  const proposal = await getProposalById(proposalId);
  
  if (!proposal) {
    logger.warn({ proposalId }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  logger.debug({ proposalId }, 'Proposal retrieved successfully');
  res.status(200).json(proposal);
};

// Proposal Votes
const _submitProposalVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { proposal_id, toaddress, amountsent } = req.body;
  if (!proposal_id || !toaddress || !amountsent) {
    logger.warn({ body: req.body }, 'Missing required fields for proposal vote');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ proposal_id, toaddress, amountsent }, 'Submitting proposal vote');
  
  // Calculate vote weight
  const voteWeight = calculateVoteWeight(amountsent);
  
  const newVote = await createProposalVote({
    proposal_id,
    toaddress,
    amountsent: new Decimal(amountsent.toString()),
    votescounted: voteWeight.votes,
    validvote: true,
    proposal_snapshot_id: undefined  // Let the database handle the default value
  });

  logger.info({ voteId: newVote.id }, 'Vote submitted successfully');
  res.status(201).json(newVote);
};

const _fetchVotesForProposal = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId }, 'Fetching votes for proposal');
  const votes = await getVotesForProposal(proposalId);
  logger.debug({ proposalId, voteCount: votes.length }, 'Votes retrieved successfully');
  res.status(200).json(votes);
};

// Proposal Yes Votes
const _fetchAllProposalYesVotes = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching all proposal yes votes');
  const votes = await getAllProposalYesVotes();
  res.status(200).json(votes);
};

const _submitProposalYesVote = async (req: Request, res: Response): Promise<void> => {
  const { proposal_id, transaction_hash } = req.body;
  if (!proposal_id || !transaction_hash) {
    logger.warn({ body: req.body }, 'Missing required fields for yes vote');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ proposal_id, transaction_hash }, 'Starting submitProposalYesVote');
  
  // Get transaction details first
  const response = await getKRC20OperationDetails(transaction_hash);
  logger.debug({ response }, 'Transaction response received');
  
  if (!response || !response.result || !Array.isArray(response.result) || response.result.length === 0) {
    logger.warn({ transaction_hash }, 'Transaction not found or not confirmed');
    res.status(400).json({ error: 'Transaction not found or not confirmed' });
    return;
  }

  const txDetails = response.result[0];
  logger.debug({ txDetails }, 'Transaction details extracted');

  // Check if this transaction hash has already been used for a vote
  const existingVote = await prisma.proposal_yes_votes.findUnique({
    where: { hash: txDetails.hashRev }
  });

  if (existingVote) {
    logger.warn({ 
      transaction_hash: txDetails.hashRev,
      proposal_id: existingVote.proposal_id 
    }, 'Transaction hash already used for a vote');
    res.status(400).json({ 
      error: 'This transaction has already been used for voting',
      details: {
        proposal_id: existingVote.proposal_id,
        vote_id: existingVote.id,
        created: existingVote.created
      }
    });
    return;
  }

  // Validate transaction details
  if (!txDetails.amt) {
    logger.warn({ txDetails }, 'Transaction amount is missing');
    res.status(400).json({ error: 'Invalid transaction: amount is missing' });
    return;
  }

  if (!txDetails.from) {
    logger.warn({ txDetails }, 'Transaction from address is missing');
    res.status(400).json({ error: 'Invalid transaction: sender address is missing' });
    return;
  }

  if (!txDetails.mtsAdd) {
    logger.warn({ txDetails }, 'Transaction timestamp is missing');
    res.status(400).json({ error: 'Invalid transaction: timestamp is missing' });
    return;
  }

  // Validate it's a governance token transfer
  if (txDetails.tick !== GOV_TOKEN_TICKER || txDetails.op !== 'transfer') {
    logger.warn({ txDetails }, `Invalid transaction: not a ${GOV_TOKEN_TICKER} transfer`);
    res.status(400).json({ error: `Invalid transaction: must be a ${GOV_TOKEN_TICKER} transfer` });
    return;
  }

  // Validate the transaction is accepted
  if (txDetails.txAccept !== '1' || txDetails.opAccept !== '1') {
    logger.warn({ txDetails }, 'Transaction not accepted');
    res.status(400).json({ error: 'Transaction not accepted' });
    return;
  }

  // Convert amount from 8 decimal places using string operations to avoid floating point issues
  const rawAmount = BigInt(txDetails.amt);
  const amountForCalc = Number(rawAmount) / Math.pow(10, 8);
  const amountForStorage = new Decimal(txDetails.amt).div(Math.pow(10, 8));
  
  logger.debug({ 
    rawAmount: txDetails.amt,
    amountForCalc,
    amountForStorage: amountForStorage.toString()
  }, 'Amount conversion details');

  // Get proposal to check voting period
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposal_id }
  });
  
  if (!proposal) {
    logger.warn({ proposal_id }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  logger.debug({ proposal }, 'Proposal found');

  // Validate voting period using properly converted timestamp
  const txTime = new Date(parseInt(txDetails.mtsAdd));
  const openVote = proposal.openvote ? new Date(proposal.openvote) : null;
  const closeVote = proposal.closevote ? new Date(proposal.closevote) : null;

  logger.debug({ 
    txTime,
    openVote,
    closeVote
  }, 'Vote timing details');

  if (!openVote || !closeVote) {
    logger.warn({ proposal_id }, 'Voting period not set for this proposal');
    res.status(400).json({ error: 'Voting period not set for this proposal' });
    return;
  }

  if (txTime < openVote || txTime > closeVote) {
    logger.warn({ 
      txTime,
      openVote,
      closeVote,
      proposal_id 
    }, 'Transaction timestamp outside voting period');
    res.status(400).json({ error: 'Transaction timestamp outside voting period' });
    return;
  }

  // Calculate vote weight using the precise amount
  const voteWeight = calculateVoteWeight(amountForCalc);
  logger.debug({ voteWeight }, 'Vote weight calculated');
  
  // Create the vote with converted amount and blockchain hash
  const voteData = {
    proposal_id,
    hash: txDetails.hashRev,
    toaddress: YES_ADDRESS,
    fromaddress: txDetails.from,
    amountsent: amountForStorage,
    votescounted: voteWeight.votes,
    validvote: true
  };
  
  logger.debug({ voteData }, 'Attempting to create vote');
  
  // Need to handle potential unique constraint errors directly
  const vote = await createProposalYesVote(voteData);
  
  logger.info({ 
    voteId: vote.id,
    votes: voteWeight.votes,
    powerLevel: voteWeight.powerLevel,
    transaction_hash: txDetails.hashRev
  }, 'Vote created successfully');
  
  res.status(200).json({
    id: vote.id,
    votes: voteWeight.votes,
    powerLevel: voteWeight.powerLevel,
    transaction_hash: txDetails.hashRev
  });
};

// Proposal No Votes
const _fetchAllProposalNoVotes = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching all proposal no votes');
  const votes = await getAllProposalNoVotes();
  res.status(200).json(votes);
};

const _submitProposalNoVote = async (req: Request, res: Response): Promise<void> => {
  const { proposal_id, transaction_hash } = req.body;
  if (!proposal_id || !transaction_hash) {
    logger.warn({ body: req.body }, 'Missing required fields for no vote');
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  logger.info({ proposal_id, transaction_hash }, 'Starting submitProposalNoVote');
  
  // Get transaction details first
  const response = await getKRC20OperationDetails(transaction_hash);
  logger.debug({ response }, 'Transaction response received');
  
  if (!response || !response.result || !Array.isArray(response.result) || response.result.length === 0) {
    logger.warn({ transaction_hash }, 'Transaction not found or not confirmed');
    res.status(400).json({ error: 'Transaction not found or not confirmed' });
    return;
  }

  const txDetails = response.result[0];
  logger.debug({ txDetails }, 'Transaction details extracted');

  // Check if this transaction hash has already been used for a vote
  const existingVote = await prisma.proposal_no_votes.findUnique({
    where: { hash: txDetails.hashRev }
  });

  if (existingVote) {
    logger.warn({ 
      transaction_hash: txDetails.hashRev,
      proposal_id: existingVote.proposal_id 
    }, 'Transaction hash already used for a vote');
    res.status(400).json({ 
      error: 'This transaction has already been used for voting',
      details: {
        proposal_id: existingVote.proposal_id,
        vote_id: existingVote.id,
        created: existingVote.created
      }
    });
    return;
  }

  // Validate transaction details
  if (!txDetails.amt) {
    logger.warn({ txDetails }, 'Transaction amount is missing');
    res.status(400).json({ error: 'Invalid transaction: amount is missing' });
    return;
  }

  if (!txDetails.from) {
    logger.warn({ txDetails }, 'Transaction from address is missing');
    res.status(400).json({ error: 'Invalid transaction: sender address is missing' });
    return;
  }

  if (!txDetails.mtsAdd) {
    logger.warn({ txDetails }, 'Transaction timestamp is missing');
    res.status(400).json({ error: 'Invalid transaction: timestamp is missing' });
    return;
  }

  // Validate it's a governance token transfer
  if (txDetails.tick !== GOV_TOKEN_TICKER || txDetails.op !== 'transfer') {
    logger.warn({ txDetails }, `Invalid transaction: not a ${GOV_TOKEN_TICKER} transfer`);
    res.status(400).json({ error: `Invalid transaction: must be a ${GOV_TOKEN_TICKER} transfer` });
    return;
  }

  // Validate the transaction is accepted
  if (txDetails.txAccept !== '1' || txDetails.opAccept !== '1') {
    logger.warn({ txDetails }, 'Transaction not accepted');
    res.status(400).json({ error: 'Transaction not accepted' });
    return;
  }

  // Convert amount from 8 decimal places using string operations to avoid floating point issues
  const rawAmount = BigInt(txDetails.amt);
  const amountForCalc = Number(rawAmount) / Math.pow(10, 8);
  const amountForStorage = new Decimal(txDetails.amt).div(Math.pow(10, 8));
  
  logger.debug({ 
    rawAmount: txDetails.amt,
    amountForCalc,
    amountForStorage: amountForStorage.toString()
  }, 'Amount conversion details');

  // Get proposal to check voting period
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposal_id }
  });
  
  if (!proposal) {
    logger.warn({ proposal_id }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  logger.debug({ proposal }, 'Proposal found');

  // Validate voting period using properly converted timestamp
  const txTime = new Date(parseInt(txDetails.mtsAdd));
  const openVote = proposal.openvote ? new Date(proposal.openvote) : null;
  const closeVote = proposal.closevote ? new Date(proposal.closevote) : null;

  logger.debug({ 
    txTime,
    openVote,
    closeVote
  }, 'Vote timing details');

  if (!openVote || !closeVote) {
    logger.warn({ proposal_id }, 'Voting period not set for this proposal');
    res.status(400).json({ error: 'Voting period not set for this proposal' });
    return;
  }

  if (txTime < openVote || txTime > closeVote) {
    logger.warn({ 
      txTime,
      openVote,
      closeVote,
      proposal_id 
    }, 'Transaction timestamp outside voting period');
    res.status(400).json({ error: 'Transaction timestamp outside voting period' });
    return;
  }

  // Calculate vote weight using the precise amount
  const voteWeight = calculateVoteWeight(amountForCalc);
  logger.debug({ voteWeight }, 'Vote weight calculated');
  
  // Create the vote with converted amount and blockchain hash
  const voteData = {
    proposal_id,
    hash: txDetails.hashRev,
    toaddress: NO_ADDRESS,
    fromaddress: txDetails.from,
    amountsent: amountForStorage,
    votescounted: voteWeight.votes,
    validvote: true
  };
  
  logger.debug({ voteData }, 'Attempting to create vote');
  
  // Need to handle potential unique constraint errors directly
  const vote = await createProposalNoVote(voteData);
      
  logger.info({ 
    voteId: vote.id,
    votes: voteWeight.votes,
    powerLevel: voteWeight.powerLevel,
    transaction_hash: txDetails.hashRev
  }, 'Vote created successfully');
  
  res.status(200).json({
    id: vote.id,
    votes: voteWeight.votes,
    powerLevel: voteWeight.powerLevel,
    transaction_hash: txDetails.hashRev
  });
};

// Refactored removeProposal
const _removeProposal = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.proposalId, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.proposalId }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId }, 'Removing proposal');
  await deleteProposal(proposalId);
  logger.info({ proposalId }, 'Proposal deleted successfully');
  res.status(204).send();
};

// Proposal Nominations
const _fetchAllProposalNominations = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching all proposal nominations');
  const nominations = await getAllProposalNominations();
  logger.debug({ nominationCount: nominations.length }, 'Nominations retrieved successfully');
  res.status(200).json(nominations);
};

const _submitProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const nomination: Omit<ProposalNomination, 'id'> = req.body;
  logger.info({ nomination }, 'Submitting proposal nomination');
  
  const newNomination = await createProposalNomination(nomination);
  logger.info({ nominationId: newNomination.id }, 'Nomination submitted successfully');
  res.status(201).json(newNomination);
};

const _modifyProposalNomination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
    res.status(400).json({ error: 'Invalid nomination ID' });
    return;
  }

  const nominationData: Partial<ProposalNomination> = req.body;
  logger.info({ nominationId: id, updates: nominationData }, 'Modifying proposal nomination');
  
  const updatedNomination = await updateProposalNomination(id, nominationData);
  logger.info({ nominationId: id }, 'Nomination updated successfully');
  res.status(200).json(updatedNomination);
};

const _removeProposalNomination = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ nominationId: req.params.id }, 'Invalid nomination ID format');
    res.status(400).json({ error: 'Invalid nomination ID' });
    return;
  }

  logger.info({ nominationId: id }, 'Removing proposal nomination');
  await deleteProposalNomination(id);
  logger.info({ nominationId: id }, 'Nomination deleted successfully');
  res.status(204).send();
};

// Proposal Types
const _fetchAllProposalTypes = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching all proposal types');
  const types = await getAllProposalTypes();
  
  // Transform to match frontend expectations
  const transformedTypes = types.map(type => ({
    id: type.id,
    name: type.name || '',
    simple: type.simplevote || false
  }));
  
  logger.debug({ typeCount: types.length }, 'Proposal types retrieved successfully');
  res.status(200).json(transformedTypes);
};

const _addProposalType = async (req: Request, res: Response): Promise<void> => {
  const { name, simple } = req.body;
  logger.info({ name, simple }, 'Adding proposal type');
  
  const newType = await createProposalType(name, simple);
  
  // Transform to match frontend expectations
  const transformedType = {
    id: newType.id,
    name: newType.name || '',
    simple: newType.simplevote || false
  };
  
  logger.info({ typeId: newType.id }, 'Proposal type created successfully');
  res.status(201).json(transformedType);
};

const _modifyProposalType = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
    res.status(400).json({ error: 'Invalid type ID' });
    return;
  }

  const { name, simple } = req.body;
  logger.info({ typeId: id, name, simple }, 'Modifying proposal type');
  
  const updatedType = await updateProposalType(id, name, simple);
  
  // Transform to match frontend expectations
  const transformedType = {
    id: updatedType.id,
    name: updatedType.name || '',
    simple: updatedType.simplevote || false
  };
  
  logger.info({ typeId: id }, 'Proposal type updated successfully');
  res.status(200).json(transformedType);
};

const _removeProposalType = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ typeId: req.params.id }, 'Invalid type ID format');
    res.status(400).json({ error: 'Invalid type ID' });
    return;
  }

  logger.info({ typeId: id }, 'Removing proposal type');
  await deleteProposalType(id);
  logger.info({ typeId: id }, 'Proposal type deleted successfully');
  res.status(204).send();
};

// Proposal Status
const _fetchAllProposalStatuses = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching all proposal statuses');
  const statuses = await getAllProposalStatuses();
  
  // Transform to match frontend expectations
  const transformedStatuses = statuses.map(status => ({
    id: status.id,
    name: status.name || '',
    active: status.active || false
  }));
  
  logger.debug({ statusCount: statuses.length }, 'Proposal statuses retrieved successfully');
  res.status(200).json(transformedStatuses);
};

const _addProposalStatus = async (req: Request, res: Response): Promise<void> => {
  const { name, active } = req.body;
  logger.info({ name, active }, 'Adding proposal status');
  
  const newStatus = await createProposalStatus(name, active);
  
  // Transform to match frontend expectations
  const transformedStatus = {
    id: newStatus.id,
    name: newStatus.name || '',
    active: newStatus.active || false
  };
  
  logger.info({ statusId: newStatus.id }, 'Proposal status created successfully');
  res.status(201).json(transformedStatus);
};

const _modifyProposalStatus = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
    res.status(400).json({ error: 'Invalid status ID' });
    return;
  }

  const { name, active } = req.body;
  logger.info({ statusId: id, name, active }, 'Modifying proposal status');
  
  const updatedStatus = await updateProposalStatus(id, name, active);
  
  // Transform to match frontend expectations
  const transformedStatus = {
    id: updatedStatus.id,
    name: updatedStatus.name || '',
    active: updatedStatus.active || false
  };
  
  logger.info({ statusId: id }, 'Proposal status updated successfully');
  res.status(200).json(transformedStatus);
};

const _removeProposalStatus = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    logger.warn({ statusId: req.params.id }, 'Invalid status ID format');
    res.status(400).json({ error: 'Invalid status ID' });
    return;
  }

  logger.info({ statusId: id }, 'Removing proposal status');
  await deleteProposalStatus(id);
  logger.info({ statusId: id }, 'Proposal status deleted successfully');
  res.status(204).send();
};

// Proposal Qualification
const _qualifyProposal = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.proposalId, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.proposalId }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId, updates: req.body }, 'Qualifying proposal');
  const updatedProposal = await updateProposal(proposalId, req.body);
  if (!updatedProposal) {
    logger.warn({ proposalId }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  logger.debug({ proposalId }, 'Fetching proposal with wallet details');
  const proposalWithWallet = await getProposalById(proposalId);
  if (!proposalWithWallet) {
    logger.warn({ proposalId }, 'Proposal not found after update');
    res.status(404).json({ error: 'Proposal not found after update' });
    return;
  }

  logger.debug('Calculating proposal submission fee');
  const fee = await proposalEditFee();

  logger.info({ proposalId, fee, wallet: proposalWithWallet.wallet }, 'Proposal qualified successfully');
  res.status(200).json({
    fee,
    wallet: proposalWithWallet.wallet,
  });
};

const _fetchNominationsForProposal = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId }, 'Fetching nominations for proposal');
  const nominations = await getNominationsForProposal(proposalId);
  logger.debug({ proposalId, count: nominations.length }, 'Nominations retrieved successfully');
  res.status(200).json(nominations);
};

const _fetchActiveProposalCount = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching active proposal count');
  const count = await countActiveProposals();
  logger.debug({ count }, 'Active proposal count retrieved successfully');
  res.status(200).json(count);
};

const _fetchNominationCount = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  logger.info({ proposalId }, 'Fetching nomination count for proposal');
  const count = await countNominationsForProposal(proposalId);
  logger.debug({ proposalId, count }, 'Nomination count retrieved successfully');
  res.status(200).json({ nominationCount: count });
};

// Config endpoint
const _getGovConfig = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching governance configuration');
  const govConfig = {
    govTokenTicker: config.tokens.govTokenTicker,
    proposals: {
      editFeeUsd: config.proposals.editFeeUsd,
      nominationFeeUsd: config.proposals.nominationFeeUsd,
      votingFeeMin: config.proposals.votingFeeMin,
      votingFeeMax: config.proposals.votingFeeMax
    },
    candidates: {
      nominationFeeUsd: config.candidates.nominationFeeUsd
    },
    addresses: {
      gov: GOV_ADDRESS,
      yes: YES_ADDRESS,
      no: NO_ADDRESS
    }
  };
  
  res.status(200).json(govConfig);
};

// Nomination Fee Functions
const _getNominationFee = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching nomination fee');
  const fee = await proposalNominationFee();
  logger.debug({ fee }, 'Nomination fee retrieved successfully');
  res.status(200).json({ fee });
};

// Proposal Edit Fee Functions
const _getEditFee = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching proposal edit fee');
  const fee = await proposalEditFee();
  logger.debug({ fee }, 'Proposal edit fee retrieved successfully');
  res.status(200).json({ fee });
};

// Verify nomination transaction
const _verifyNominationTransaction = async (req: Request, res: Response): Promise<void> => {
  const { fee, proposalId } = req.body;
  logger.info({ proposalId, fee }, 'Starting nomination transaction verification');

  const proposal = await getProposalById(proposalId);
  if (!proposal || !proposal.proposal_wallets_proposals_walletToproposal_wallets) {
    logger.warn({ proposalId }, 'Proposal or wallet not found');
    res.status(404).json({ error: 'Proposal or wallet not found' });
    return;
  }

  const walletAddress = proposal.proposal_wallets_proposals_walletToproposal_wallets.address;
  if (!walletAddress) {
    logger.warn({ proposalId }, 'Wallet address not found');
    res.status(404).json({ error: 'Wallet address not found' });
    return;
  }

  // Convert fee to sompi (1 KAS = 100000000 sompi) using Decimal for precise math
  const targetAmount = new Decimal(fee).mul(new Decimal('100000000')).toNumber();
  logger.debug({ walletAddress, targetAmount, originalFee: fee }, 'Checking for transaction with calculated amount');

  // Generate a verification ID that includes the proposal ID, target amount, and timestamp
  const timestamp = Date.now();
  const verificationId = Buffer.from(`${proposalId}-${targetAmount}-${timestamp}`).toString('base64');

  // Send immediate response that verification has started
  res.status(202).json({ 
    status: 'pending',
    message: 'Verification process started',
    retryAfter: 3, // seconds
    verificationId,
    expectedAmount: targetAmount,
    walletAddress,
    ticker: GOV_TOKEN_TICKER
  });

  // Start verification process in the background
  (async () => {
    let transactionCheckAttempts = 0;
    const maxAttempts = 30; // 90 seconds with 3-second intervals

    while (transactionCheckAttempts < maxAttempts) {
      try {
        const response = await getKRC20OperationList({
          address: walletAddress,
          tick: GOV_TOKEN_TICKER
        });

        logger.debug({ 
          response,
          targetAmount,
          walletAddress,
          ticker: GOV_TOKEN_TICKER
        }, 'Checking KRC20 operations');

        if (response?.result && Array.isArray(response.result)) {
          logger.debug({ 
            transactionCount: response.result.length,
            targetAmount,
            walletAddress,
            ticker: GOV_TOKEN_TICKER
          }, 'Found transactions to check');

          // Check if this address has already nominated
          const existingNominations = await getNominationsForProposal(proposalId);
          
          // Look for transactions after the verification started
          for (const operation of response.result) {
            // Convert operation amount to number for comparison
            const operationAmount = operation.amt ? Number(operation.amt) : 0;
            const operationTimestamp = new Date(Number(operation.mtsAdd)).getTime();
            
            // Add detailed logging for debugging
            logger.info({ 
              debug: {
                expectedAmount: targetAmount,
                receivedAmount: operationAmount,
                expectedTicker: GOV_TOKEN_TICKER,
                receivedTicker: operation.tick,
                expectedAddress: walletAddress,
                receivedAddress: operation.to,
                transactionTimestamp: operationTimestamp,
                verificationStartTime: timestamp,
                amountMatches: operationAmount === targetAmount,
                tickerMatches: operation.tick === GOV_TOKEN_TICKER,
                addressMatches: operation.to === walletAddress,
                timestampMatches: operationTimestamp > (timestamp - 3600000) // Accept transactions from last hour
              }
            }, 'Debug: Transaction match details');

            // Check if this address has already nominated
            const hasExistingNomination = existingNominations.some(
              nom => nom.fromaddress?.toLowerCase() === operation.from.toLowerCase()
            );

            if (hasExistingNomination) {
              logger.warn({ 
                fromAddress: operation.from,
                proposalId 
              }, 'Address has already nominated this proposal');
              continue;
            }

            const matches = {
              to: operation.to === walletAddress,
              amount: operationAmount === targetAmount,
              tick: operation.tick === GOV_TOKEN_TICKER,
              timestamp: operationTimestamp > (timestamp - 3600000) // Accept transactions from last hour
            };

            logger.debug({ 
              operation: {
                from: operation.from,
                to: operation.to,
                amount: operationAmount,
                tick: operation.tick,
                timestamp: operationTimestamp
              },
              expected: {
                to: walletAddress,
                amount: targetAmount,
                tick: GOV_TOKEN_TICKER,
                timestampAfter: timestamp
              },
              matches
            }, 'Checking operation');

            if (matches.to && matches.amount && matches.tick && matches.timestamp) {
              logger.info({ 
                proposalId,
                hashRev: operation.hashRev,
                amount: operation.amt,
                tick: operation.tick,
                fromAddress: operation.from
              }, 'Found matching transaction, creating nomination');
              
              // Create the nomination
              const nomination = await createProposalNomination({
                proposal_id: proposalId,
                toaddress: walletAddress,
                amountsent: new Decimal(fee.toString()),
                hash: operation.hashRev,
                created: new Date(),
                validvote: true,
                fromaddress: operation.from
              });

              // Check if this is the first nomination for this proposal
              const currentNominations = await getNominationsForProposal(proposalId);
              if (currentNominations.length === 1) {
                logger.info({ proposalId }, 'First nomination received, updating proposal status to 3');
                await updateProposal(proposalId, { status: 3 });
              }
              
              logger.info({ nominationId: nomination.id, proposalId }, 'Nomination created successfully');
              return;
            }
          }
        }

        transactionCheckAttempts++;
        logger.debug({ 
          attempt: transactionCheckAttempts, 
          maxAttempts, 
          proposalId 
        }, 'Transaction not found, continuing to check');

        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        logger.error({ error, proposalId }, 'Error during transaction check');
        return;
      }
    }

    logger.warn({ proposalId }, 'Transaction verification timed out');
  })();
};

// Get nomination verification status
const _getNominationVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  const { verificationId } = req.query;

  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  if (!verificationId || typeof verificationId !== 'string') {
    logger.warn({ proposalId, verificationId }, 'Missing or invalid verificationId parameter');
    res.status(400).json({ error: 'Missing or invalid verificationId parameter' });
    return;
  }

  // Decode the verification ID to get the target amount and timestamp
  const [encodedProposalId, encodedAmount, timestamp] = Buffer.from(verificationId, 'base64')
    .toString()
    .split('-');

  if (Number(encodedProposalId) !== proposalId) {
    logger.warn({ proposalId, verificationId }, 'Verification ID does not match proposal ID');
    res.status(400).json({ error: 'Invalid verification ID' });
    return;
  }

  // Check if a nomination exists for this proposal that was created after the verification started
  const nominations = await getNominationsForProposal(proposalId);
  const nomination = nominations.find(n => {
    const createdDate = n.created ? new Date(n.created).getTime() : 0;
    return createdDate > Number(timestamp);
  });

  if (nomination) {
    logger.info({ proposalId, verificationId }, 'Nomination verification completed');
    res.status(200).json({
      status: 'completed',
      nomination: {
        ...nomination,
        fromAddress: nomination.fromaddress // Include the from address in the response
      },
      proposal: await getProposalById(proposalId) // Include updated proposal data
    });
  } else {
    logger.debug({ proposalId, verificationId }, 'Nomination not found, still pending');
    res.status(200).json({
      status: 'pending',
      message: 'Verification in progress'
    });
  }
};

// Verify proposal edit for existing nominator
const _verifyProposalEditWithExistingNomination = async (req: Request, res: Response): Promise<void> => {
  const proposalId = parseInt(req.params.id, 10);
  const { transactionHash, fee } = req.body;

  if (isNaN(proposalId)) {
    logger.warn({ proposalId: req.params.id }, 'Invalid proposal ID format');
    res.status(400).json({ error: 'Invalid proposal ID' });
    return;
  }

  if (!transactionHash) {
    logger.warn('No transaction hash provided');
    res.status(400).json({ error: 'Transaction hash is required' });
    return;
  }

  if (!fee) {
    logger.warn('No fee provided');
    res.status(400).json({ error: 'Fee is required' });
    return;
  }

  // Get the proposal with voting fields
  const proposal = await prisma.proposals.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    logger.warn({ proposalId }, 'Proposal not found');
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  // Check proposal state
  if (proposal.openvote || proposal.closevote) {
    logger.warn({ proposalId }, 'Cannot edit proposal after voting has started');
    res.status(400).json({ error: 'Cannot edit proposal after voting has started' });
    return;
  }

  if (proposal.votesactive) {
    logger.warn({ proposalId }, 'Cannot edit proposal while voting is active');
    res.status(400).json({ error: 'Cannot edit proposal while voting is active' });
    return;
  }

  if (proposal.passed) {
    logger.warn({ proposalId }, 'Cannot edit proposal that has passed');
    res.status(400).json({ error: 'Cannot edit proposal that has passed' });
    return;
  }

  // Get the proposal's nominations ordered by creation date
  const nominations = await getNominationsForProposal(proposalId);
  if (!nominations || nominations.length === 0) {
    logger.warn({ proposalId }, 'No nominations found for proposal');
    res.status(404).json({ error: 'No nominations found for proposal' });
    return;
  }

  // Sort nominations by creation date and get the oldest one
  const oldestNomination = nominations.sort((a, b) => {
    const dateA = a.created ? new Date(a.created).getTime() : 0;
    const dateB = b.created ? new Date(b.created).getTime() : 0;
    return dateA - dateB;
  })[0];

  if (!oldestNomination.fromaddress) {
    logger.warn({ proposalId }, 'Original nominator address not found');
    res.status(404).json({ error: 'Original nominator address not found' });
    return;
  }

  // Get the transaction details from Kasplex API
  const response = await getKRC20OperationDetails(transactionHash);
  if (!response || !response.result || !Array.isArray(response.result) || response.result.length === 0) {
    logger.warn({ transactionHash }, 'Transaction not found');
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  const operation = response.result[0];
  if (!operation) {
    logger.warn({ transactionHash }, 'Transaction details not found');
    res.status(404).json({ error: 'Transaction details not found' });
    return;
  }

  // Convert fee to sats for comparison with transaction amount
  const feeInSats = new Decimal(fee).mul(new Decimal('100000000')).toString();
  logger.debug({ 
    feeInSats,
    transactionAmount: operation.amt,
    originalFee: fee 
  }, 'Amount comparison details');

  // Verify the transaction is for the correct token and amount
  if (operation.tick !== GOV_TOKEN_TICKER || operation.amt !== feeInSats) {
    logger.warn({ 
      operation,
      expectedAmount: feeInSats,
      receivedAmount: operation.amt,
      expectedTicker: GOV_TOKEN_TICKER,
      receivedTicker: operation.tick,
      amountMatches: operation.amt === feeInSats,
      tickerMatches: operation.tick === GOV_TOKEN_TICKER
    }, 'Invalid transaction details');
    res.status(400).json({ error: 'Invalid transaction' });
    return;
  }

  // Verify the sender matches the original nominator
  if (operation.from.toLowerCase() !== oldestNomination.fromaddress.toLowerCase()) {
    logger.warn({ 
      from: operation.from, 
      nominator: oldestNomination.fromaddress 
    }, 'Transaction sender does not match original nominator');
    res.status(403).json({ error: 'Only the original nominator can edit the proposal' });
    return;
  }

  // Find the nomination with the matching hash
  const verifiedNomination = nominations.find(nom => nom.hash === transactionHash);
  if (!verifiedNomination) {
    logger.warn({ transactionHash }, 'No nomination found with this transaction hash');
    res.status(404).json({ error: 'No nomination found with this transaction hash' });
    return;
  }

  logger.info({ proposalId, transactionHash }, 'Edit verification successful');
  res.status(200).json({ 
    status: 'completed',
    nomination: oldestNomination,
    originalNominator: oldestNomination.fromaddress
  });
};

// Export all refactored handlers
export const submitProposal = withErrorHandling(_submitProposal, logger);
export const fetchAllProposals = withDirectErrorHandling(_fetchAllProposals, logger);
export const modifyProposal = withErrorHandling(_modifyProposal, logger);
export const fetchProposalById = withDirectErrorHandling(_fetchProposalById, logger);
export const submitProposalVote = withErrorHandling(_submitProposalVote, logger);
export const fetchVotesForProposal = withDirectErrorHandling(_fetchVotesForProposal, logger);
export const fetchAllProposalYesVotes = withDirectErrorHandling(_fetchAllProposalYesVotes, logger);
export const submitProposalYesVote = withDirectErrorHandling(_submitProposalYesVote, logger);
export const fetchAllProposalNoVotes = withDirectErrorHandling(_fetchAllProposalNoVotes, logger);
export const submitProposalNoVote = withDirectErrorHandling(_submitProposalNoVote, logger);
export const removeProposal = withDirectErrorHandling(_removeProposal, logger);
export const fetchAllProposalNominations = withDirectErrorHandling(_fetchAllProposalNominations, logger);
export const submitProposalNomination = withErrorHandling(_submitProposalNomination, logger);
export const modifyProposalNomination = withErrorHandling(_modifyProposalNomination, logger);
export const removeProposalNomination = withDirectErrorHandling(_removeProposalNomination, logger);
export const fetchAllProposalTypes = withDirectErrorHandling(_fetchAllProposalTypes, logger);
export const addProposalType = withDirectErrorHandling(_addProposalType, logger);
export const modifyProposalType = withDirectErrorHandling(_modifyProposalType, logger);
export const removeProposalType = withDirectErrorHandling(_removeProposalType, logger);
export const fetchAllProposalStatuses = withDirectErrorHandling(_fetchAllProposalStatuses, logger);
export const addProposalStatus = withDirectErrorHandling(_addProposalStatus, logger);
export const modifyProposalStatus = withDirectErrorHandling(_modifyProposalStatus, logger);
export const removeProposalStatus = withDirectErrorHandling(_removeProposalStatus, logger);
export const qualifyProposal = withErrorHandling(_qualifyProposal, logger);
export const fetchNominationsForProposal = withDirectErrorHandling(_fetchNominationsForProposal, logger);
export const fetchActiveProposalCount = withDirectErrorHandling(_fetchActiveProposalCount, logger);
export const fetchNominationCount = withErrorHandling(_fetchNominationCount, logger);
export const getGovConfig = withDirectErrorHandling(_getGovConfig, logger);
export const getNominationFee = withDirectErrorHandling(_getNominationFee, logger);
export const getEditFee = withDirectErrorHandling(_getEditFee, logger);
export const verifyNominationTransaction = withErrorHandling(_verifyNominationTransaction, logger);
export const getNominationVerificationStatus = withDirectErrorHandling(_getNominationVerificationStatus, logger);
export const verifyProposalEditWithExistingNomination = withDirectErrorHandling(_verifyProposalEditWithExistingNomination, logger); 