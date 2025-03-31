import { createModuleLogger } from './logger.js';
import { config, GOV_TOKEN_TICKER } from '../config/env.js';
import { getKRC20OperationList } from '../services/kasplexAPI.js';

const logger = createModuleLogger('transactionVerificationUtils');

interface TransactionVerificationResult {
    isValid: boolean;
    hash?: string;
    error?: string;
    address?: string;
    amount?: string;
}

export async function verifyTransaction(
    address: string,
    expectedAmount: number | string
): Promise<TransactionVerificationResult> {
    try {
        // Get recent KRC20 operations for the address
        const operations = await getKRC20OperationList({ 
            address,
            tick: GOV_TOKEN_TICKER
        });

        if (!operations?.result || operations.result.length === 0) {
            return {
                isValid: false,
                error: 'No KRC20 transactions found for address'
            };
        }

        // Convert expectedAmount to string for comparison
        const expectedAmountStr = expectedAmount.toString();

        // Find a transaction with matching amount
        const matchingTransaction = operations.result.find(operation => {
            return operation.amt === expectedAmountStr && 
                   operation.txAccept === '1' && 
                   operation.opAccept === '1';
        });

        if (!matchingTransaction) {
            return {
                isValid: false,
                error: `No confirmed KRC20 transaction found with amount ${expectedAmountStr}`
            };
        }

        return {
            isValid: true,
            hash: matchingTransaction.hashRev
        };
    } catch (error) {
        logger.error({ error, address, expectedAmount }, 'Error verifying KRC20 transaction');
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown error verifying KRC20 transaction'
        };
    }
}

/**
 * Converts a decimal amount to chain format (without decimal point)
 * @param decimalAmount - The amount with decimal point (e.g., "2030.92177067")
 * @returns The amount without decimal point (e.g., "203092170967")
 */
export const convertToChainAmount = (decimalAmount: string): string => {
  try {
    // Remove any trailing zeros after decimal point
    const normalizedAmount = decimalAmount.replace(/\.?0+$/, '');
    
    // Split into whole and decimal parts
    const [wholePart, decimalPart] = normalizedAmount.split('.');
    
    if (!decimalPart) {
      // If no decimal part, just return the whole part with 8 zeros
      return `${wholePart}00000000`;
    }
    
    // Pad or truncate decimal part to 8 digits
    const paddedDecimal = decimalPart.padEnd(8, '0').slice(0, 8);
    
    // Combine parts without decimal point
    return `${wholePart}${paddedDecimal}`;
  } catch (error) {
    logger.error({ error, decimalAmount }, 'Error converting amount to chain format');
    throw new Error('Invalid amount format');
  }
};

export const verifyTransactionByHash = async (address: string, hash: string): Promise<{ 
  isValid: boolean; 
  error?: string; 
  hash?: string; 
  address?: string; 
  amt?: string | number;
}> => {
  let transactionCheckAttempts = 0;
  const maxAttempts = 30; // 90 seconds with 3-second intervals

  while (transactionCheckAttempts < maxAttempts) {
    try {
      // Get recent KRC20 operations for the address
      logger.info({ address, hash, attempt: transactionCheckAttempts + 1 }, 'Verifying transaction by hash');
      const operations = await getKRC20OperationList({ 
        address,
        tick: GOV_TOKEN_TICKER
      });

      if (!operations?.result || operations.result.length === 0) {
        logger.info({ attempt: transactionCheckAttempts + 1 }, 'No transactions found, retrying...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        transactionCheckAttempts++;
        continue;
      }

      // Find transaction with matching hash
      const matchingTransaction = operations.result.find(operation => 
        operation.hashRev === hash && 
        operation.txAccept === '1' && 
        operation.opAccept === '1'
      );

      if (matchingTransaction) {
        logger.info({ 
          hash, 
          address,
          amount: matchingTransaction.amt,
          from: matchingTransaction.from,
          to: matchingTransaction.to,
          tick: matchingTransaction.tick
        }, 'Transaction verified successfully');
        return {
          isValid: true,
          hash: matchingTransaction.hashRev,
          address: matchingTransaction.from,
          amt: matchingTransaction.amt
        };
      }

      logger.info({ attempt: transactionCheckAttempts + 1 }, 'Transaction not found, retrying...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      transactionCheckAttempts++;
    } catch (error) {
      logger.error({ error, address, hash, attempt: transactionCheckAttempts + 1 }, 'Error verifying KRC20 transaction by hash');
      await new Promise(resolve => setTimeout(resolve, 3000));
      transactionCheckAttempts++;
    }
  }

  return {
    isValid: false,
    error: 'Transaction verification timed out'
  };
}; 