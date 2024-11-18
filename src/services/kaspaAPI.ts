import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const KASPA_API_BASE_URL = process.env.KASPA_API_BASE_URL || 'https://api.kaspa.org';
const KSPR_MARKETPLACE_DATA_URL = process.env.KSPR_MARKETPLACE_DATA_URL || 'https://storage.googleapis.com/kspr-api-v1/marketplace/marketplace.json';

const kaspaAPI = axios.create({
  baseURL: KASPA_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get balance for a given Kaspa address
export const getBalance = async (kaspaAddress: string) => {
  try {
    const response = await kaspaAPI.get(`/addresses/${kaspaAddress}/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Function to get UTXOs for a given Kaspa address
export const getUtxos = async (kaspaAddress: string) => {
  try {
    const response = await kaspaAPI.get(`/addresses/${kaspaAddress}/utxos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    throw error;
  }
};

// Function to get virtual chain blue score
export const getVirtualChainBlueScore = async () => {
  try {
    const response = await kaspaAPI.get('/info/virtual-chain-blue-score');
    return response.data;
  } catch (error) {
    console.error('Error fetching virtual chain blue score:', error);
    throw error;
  }
};

// Function to get block information by block ID
export const getBlockInfo = async (blockId: string) => {
  try {
    const response = await kaspaAPI.get(`/blocks/${blockId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching block information:', error);
    throw error;
  }
};

// Function to get transaction details by transaction ID
export const getTransactionDetails = async (transactionId: string) => {
  try {
    const response = await kaspaAPI.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};

// Function to get global network information
export const getNetworkInfo = async () => {
  try {
    const response = await kaspaAPI.get('/info/network');
    return response.data;
  } catch (error) {
    console.error('Error fetching network information:', error);
    throw error;
  }
};

// Function to get coin supply information
export const getCoinSupply = async () => {
  try {
    const response = await kaspaAPI.get('/info/coinsupply');
    return response.data;
  } catch (error) {
    console.error('Error fetching coin supply information:', error);
    throw error;
  }
};

// Function to get market cap and price
export const getMarketCapAndPrice = async () => {
  try {
    const response = await kaspaAPI.get('/info/marketcap');
    return response.data;
  } catch (error) {
    console.error('Error fetching market cap and price:', error);
    throw error;
  }
};

// Function to get marketplace data from kasFYI API
export const getKSPRMarketplaceData = async () => {
  try {
    const response = await fetch(KSPR_MARKETPLACE_DATA_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching marketplace data:', error);
    throw error;
  }
};

// Add more functions as needed to interact with other endpoints
