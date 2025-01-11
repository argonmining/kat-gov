import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { SnapshotResponse, SnapshotData } from '../types/snapshotTypes.js';
import { ofetch, FetchError } from 'ofetch';

const logger = createModuleLogger('snapshotService');

export async function fetchTokenSnapshot(): Promise<SnapshotData> {
  try {
    const ticker = config.tokens.govTokenTicker;
    const url = `https://kasplex.nachowyborski.xyz/api/v1/token/snapshot?tick=${ticker}`;
    
    logger.info({ ticker, url }, 'Fetching token snapshot from Kasplex');
    
    const response = await ofetch<SnapshotResponse>(url, {
      method: 'GET',
      timeout: 30000,
      retry: 1
    });
    
    if (!response) {
      logger.error('No data received from Kasplex API');
      throw new Error('No data received from Kasplex API');
    }

    if (!response.success) {
      logger.error({ response }, 'Kasplex API returned unsuccessful response');
      throw new Error('Failed to fetch snapshot from Kasplex API');
    }

    // Validate the response data
    if (!response.result || !response.result.holders || !response.result.summary) {
      logger.error({ 
        hasResult: !!response.result,
        hasHolders: !!(response.result && response.result.holders),
        hasSummary: !!(response.result && response.result.summary)
      }, 'Invalid snapshot data structure');
      throw new Error('Invalid snapshot data structure');
    }

    // Validate the ticker matches our config
    if (response.result.tick !== ticker) {
      logger.error({ expected: ticker, received: response.result.tick }, 'Ticker mismatch in snapshot');
      throw new Error('Ticker mismatch in snapshot data');
    }

    logger.debug({ 
      holdersCount: response.result.holders.length,
      timestamp: response.result.timestamp,
      totalSupply: response.result.summary.totalSupply
    }, 'Successfully fetched and validated snapshot');

    return response.result;
  } catch (error) {
    const fetchError = error as FetchError;
    logger.error({ 
      error: {
        message: fetchError.message,
        name: fetchError.name,
        status: fetchError.status,
        statusText: fetchError.statusText,
        data: fetchError.data
      }
    }, 'Error fetching token snapshot');
    throw error; // Re-throw to preserve the original error
  }
} 