import dotenv from 'dotenv';
import process from 'process';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('env-config');

// Determine which env file to use based on NODE_ENV
const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';

// Load environment variables
dotenv.config({ path: envFile });

logger.info({ nodeEnv: process.env.NODE_ENV, envFile }, 'Environment configuration loaded');

// Common environment variables used across the application
export const config = {
  nodeEnv: process.env.NODE_ENV || 'kdao',
  port: process.env.PORT || 7215,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || '*',
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS || '',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10), // 24 hours default
    optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS || '204', 10),
  },
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  kaspa: {
    network: process.env.KASPA_NETWORK || 'testnet-10',
    apiBaseUrl: process.env.KASPA_API_BASE_URL || 'https://api.kaspa.org',
    govAddress: process.env.GOV_ADDRESS || 'kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e',
    yesAddress: process.env.YES_ADDRESS || 'kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e',
    noAddress: process.env.NO_ADDRESS || 'kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e',
    govPrivateKey: process.env.GOV_PRIVATE_KEY,
    yesPrivateKey: process.env.YES_PRIVATE_KEY,
    noPrivateKey: process.env.NO_PRIVATE_KEY,
    priorityFeeValue: process.env.PRIORITY_FEE_VALUE || '0.5',
    wasmResolver: process.env.KASPA_WASM_RESOLVER,
    treasuryWallets: process.env.TREASURY_WALLETS ? process.env.TREASURY_WALLETS.split(',') : [],
  },
  kasplex: {
    apiBaseUrl: process.env.KASPLEX_API_BASE_URL || 'https://api.kasplex.org/v1/krc20',
    marketplaceDataUrl: process.env.KSPR_MARKETPLACE_DATA_URL || 'https://storage.googleapis.com/kspr-api-v1/marketplace/marketplace.json',
  },
  tokens: {
    govTokenTicker: process.env.GOV_TOKEN_TICKER || 'KNACHO',
  },
  timeouts: {
    transaction: parseInt(process.env.TIMEOUT || '120000', 10),
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
  proposals: {
    submissionFeeUsd: parseFloat(process.env.PROPOSAL_SUBMISSION_FEE_USD || '50'),
    nominationFeeUsd: parseFloat(process.env.PROPOSAL_NOMINATION_FEE_USD || '50'),
    votingFeeMin: process.env.VOTING_FEE_MIN ? parseFloat(process.env.VOTING_FEE_MIN) : 0.1,
    votingFeeMax: process.env.VOTING_FEE_MAX ? parseFloat(process.env.VOTING_FEE_MAX) : 100000,
    maximumVotes: parseInt(process.env.PROPOSAL_MAXIMUM_VOTES || '10000000', 10),
  },
  candidates: {
    nominationFeeUsd: parseFloat(process.env.CANDIDATE_NOMINATION_FEE_USD || '50'),
  }
};

// Export individual commonly used values for convenience
export const { nodeEnv, port } = config;
export const { network: NETWORK_ID, apiBaseUrl: KASPA_API_BASE_URL, govAddress: GOV_ADDRESS, yesAddress: YES_ADDRESS, noAddress: NO_ADDRESS, treasuryWallets: TREASURY_WALLETS } = config.kaspa;
export const { govTokenTicker: GOV_TOKEN_TICKER } = config.tokens;
export const { encryptionKey: ENCRYPTION_KEY } = config.security;
export const { apiBaseUrl: KASPLEX_API_BASE_URL } = config.kasplex;

// Export the env file path for cases where it's needed directly
export { envFile }; 