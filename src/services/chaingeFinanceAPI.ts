// src/services/chaingeFinanceAPI.ts
import { $fetch } from 'ofetch';
import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';

const logger = createModuleLogger('chaingeFinanceAPI');

const CHAINGE_FINANCE_API_URL = 'https://api.chainge.finance';

// Create a configured fetch instance
const apiFetch = $fetch.create({
  baseURL: CHAINGE_FINANCE_API_URL,
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

export async function swapKRC20ToKASPA(amount: number, sourceWallet: string, destinationWallet: string): Promise<any> {
  try {
    logger.info({ amount, sourceWallet, destinationWallet }, 'Initiating KRC20 to KASPA swap');
    return await apiFetch('/order', {
      method: 'POST',
      body: {
        source_currency: config.tokens.govTokenTicker,
        target_currency: 'KAS',
        source_amount: amount,
        from_wallet: sourceWallet,
        to_wallet: destinationWallet,
      }
    });
  } catch (error) {
    logger.error({ error, amount, sourceWallet, destinationWallet }, 'Error swapping KRC20 to KASPA');
    throw error;
  }
}
