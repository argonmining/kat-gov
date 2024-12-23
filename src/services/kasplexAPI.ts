import { $fetch } from 'ofetch';
import { getKSPRMarketplaceData } from './kaspaAPI.js';
import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';

// Initialize logger
const logger = createModuleLogger('kasplexAPI');

// Create a configured fetch instance
const apiFetch = $fetch.create({
  baseURL: config.kasplex.apiBaseUrl,
  retry: 1,
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

/**
 * Get the balance of a KRC-20 token for a specific address.
 * @param address - The address to check the balance for.
 * @param tick - The token symbol.
 * @returns The balance information.
 */
export async function getKRC20Balance(address: string, tick: string): Promise<any> {
  try {
    logger.info({ address, tick }, 'Fetching KRC20 balance');
    return await apiFetch(`/address/${address}/token/${tick}`);
  } catch (error) {
    logger.error({ error, address, tick }, 'Error in getKRC20Balance');
    throw error;
  }
}

/**
 * Get the list of KRC-20 operations.
 * @returns The list of operations.
 */
export async function getKRC20OperationList(params: { address: string, tick: string }): Promise<any> {
  try {
    logger.info(params, 'Fetching KRC20 operation list');
    return await apiFetch('/oplist', { params });
  } catch (error) {
    logger.error({ error, params }, 'Error in getKRC20OperationList');
    throw error;
  }
}

/**
 * Get details of a specific KRC-20 operation.
 * @param id - The operation ID.
 * @returns The operation details.
 */
export async function getKRC20OperationDetails(id: string): Promise<any> {
  try {
    logger.info({ id }, 'Fetching KRC20 operation details');
    return await apiFetch(`/op/${id}`);
  } catch (error) {
    logger.error({ error, id }, 'Error in getKRC20OperationDetails');
    throw error;
  }
}

/**
 * Get information about a specific KRC-20 token.
 * @param tick - The token symbol.
 * @returns The token information.
 */
export async function getKRC20Info(tick: string): Promise<any> {
  try {
    logger.info({ tick }, 'Fetching KRC20 info');
    return await apiFetch(`/token/${tick}`);
  } catch (error) {
    logger.error({ error, tick }, 'Error in getKRC20Info');
    throw error;
  }
}

/**
 * Get the price of a specific token by multiplying its floor price with KAS floor price.
 * @param ticker - The token symbol.
 * @returns The calculated token price.
 */
export async function getTokenPrice(ticker: string): Promise<number> {
  try {
    logger.info({ ticker }, 'Fetching token price');
    const marketplaceData = await getKSPRMarketplaceData();
    logger.debug({ marketplaceData }, 'Marketplace data retrieved');

    const kasFloorPrice = marketplaceData['KAS']?.floor_price;
    const tickerFloorPrice = marketplaceData[ticker]?.floor_price;

    logger.debug({ kasFloorPrice, tickerFloorPrice }, 'Floor prices retrieved');

    if (kasFloorPrice === undefined || tickerFloorPrice === undefined) {
      const error = new Error(`Floor price not found for KAS or ${ticker}`);
      logger.error({ error, ticker }, 'Missing floor price');
      throw error;
    }

    const tokenPrice = kasFloorPrice * tickerFloorPrice;
    logger.info({ ticker, tokenPrice }, 'Token price calculated');

    return tokenPrice;
  } catch (error) {
    logger.error({ error, ticker }, 'Error calculating token price');
    throw error;
  }
}
