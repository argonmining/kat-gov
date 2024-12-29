import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { SnapshotResponse, SnapshotData } from '../types/snapshotTypes.js';
import axios from 'axios';

const logger = createModuleLogger('snapshotService');

export async function fetchTokenSnapshot(): Promise<SnapshotData> {
  try {
    const ticker = config.tokens.govTokenTicker;
    const url = `${config.kasplex.apiBaseUrl}/snapshot?tick=${ticker}`;
    
    logger.info({ ticker, url }, 'Fetching token snapshot from Kasplex');
    
    const response = await axios.get<SnapshotResponse>(url);
    
    if (!response.data.success) {
      logger.error({ response: response.data }, 'Kasplex API returned unsuccessful response');
      throw new Error('Failed to fetch snapshot from Kasplex API');
    }

    // Validate the response data
    if (!response.data.data || !response.data.data.holders || !response.data.data.summary) {
      logger.error({ response: response.data }, 'Invalid snapshot data structure');
      throw new Error('Invalid snapshot data structure');
    }

    // Validate the ticker matches our config
    if (response.data.data.tick !== ticker) {
      logger.error({ expected: ticker, received: response.data.data.tick }, 'Ticker mismatch in snapshot');
      throw new Error('Ticker mismatch in snapshot data');
    }

    logger.debug({ 
      holdersCount: response.data.data.holders.length,
      timestamp: response.data.data.timestamp,
      totalSupply: response.data.data.summary.totalSupply
    }, 'Successfully fetched and validated snapshot');

    return response.data.data;
  } catch (error) {
    logger.error({ error }, 'Error fetching token snapshot');
    throw new Error('Failed to fetch token snapshot');
  }
} 