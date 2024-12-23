import { $fetch } from 'ofetch';
import dotenv from 'dotenv';
import process from 'process';
import { createModuleLogger } from '../utils/logger.js';

// Initialize logger
const logger = createModuleLogger('kaspaAPI');

// Load environment variables from .env file
const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

const KASPA_API_BASE_URL = process.env.KASPA_API_BASE_URL || 'https://api.kaspa.org';
const KSPR_MARKETPLACE_DATA_URL = process.env.KSPR_MARKETPLACE_DATA_URL || 'https://storage.googleapis.com/kspr-api-v1/marketplace/marketplace.json';

// Create a configured fetch instance
const apiFetch = $fetch.create({
  baseURL: KASPA_API_BASE_URL,
  retry: 1,
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest({ request, options }) {
    logger.debug({ url: request, options }, 'Making API request');
  },
  onRequestError({ request, error }) {
    logger.error({ url: request, error }, 'API request error');
  },
  onResponse({ request, response }) {
    logger.debug({ url: request, status: response.status }, 'API response received');
  },
  onResponseError({ request, response }) {
    logger.error({ url: request, status: response.status }, 'API response error');
  }
});

// Function to get balance for a given Kaspa address
export const getBalance = async (kaspaAddress: string) => {
  try {
    logger.info({ kaspaAddress }, 'Fetching balance');
    return await apiFetch(`/addresses/${kaspaAddress}/balance`);
  } catch (error) {
    logger.error({ error, kaspaAddress }, 'Error fetching balance');
    throw error;
  }
};

// Function to get UTXOs for a given Kaspa address
export const getUtxos = async (kaspaAddress: string) => {
  try {
    logger.info({ kaspaAddress }, 'Fetching UTXOs');
    return await apiFetch(`/addresses/${kaspaAddress}/utxos`);
  } catch (error) {
    logger.error({ error, kaspaAddress }, 'Error fetching UTXOs');
    throw error;
  }
};

// Function to get virtual chain blue score
export const getVirtualChainBlueScore = async () => {
  try {
    logger.info('Fetching virtual chain blue score');
    return await apiFetch('/info/virtual-chain-blue-score');
  } catch (error) {
    logger.error({ error }, 'Error fetching virtual chain blue score');
    throw error;
  }
};

// Function to get block information by block ID
export const getBlockInfo = async (blockId: string) => {
  try {
    logger.info({ blockId }, 'Fetching block information');
    return await apiFetch(`/blocks/${blockId}`);
  } catch (error) {
    logger.error({ error, blockId }, 'Error fetching block information');
    throw error;
  }
};

// Function to get transaction details by transaction ID
export const getTransactionDetails = async (transactionId: string) => {
  try {
    logger.info({ transactionId }, 'Fetching transaction details');
    return await apiFetch(`/transactions/${transactionId}`);
  } catch (error) {
    logger.error({ error, transactionId }, 'Error fetching transaction details');
    throw error;
  }
};

// Function to get global network information
export const getNetworkInfo = async () => {
  try {
    logger.info('Fetching network information');
    return await apiFetch('/info/network');
  } catch (error) {
    logger.error({ error }, 'Error fetching network information');
    throw error;
  }
};

// Function to get coin supply information
export const getCoinSupply = async () => {
  try {
    logger.info('Fetching coin supply information');
    return await apiFetch('/info/coinsupply');
  } catch (error) {
    logger.error({ error }, 'Error fetching coin supply information');
    throw error;
  }
};

// Function to get market cap and price
export const getMarketCapAndPrice = async () => {
  try {
    logger.info('Fetching market cap and price');
    return await apiFetch('/info/marketcap');
  } catch (error) {
    logger.error({ error }, 'Error fetching market cap and price');
    throw error;
  }
};

// Function to get marketplace data from kasFYI API
export const getKSPRMarketplaceData = async () => {
  try {
    logger.info('Fetching marketplace data');
    const response = await fetch(KSPR_MARKETPLACE_DATA_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    logger.debug({ data }, 'Marketplace data retrieved');
    return data;
  } catch (error) {
    logger.error({ error }, 'Error fetching marketplace data');
    throw error;
  }
};

// Add more functions as needed to interact with other endpoints
