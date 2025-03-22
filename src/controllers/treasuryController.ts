import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';
import { config } from '../config/env.js';
import { TreasuryTransaction } from '../types/treasuryTypes.js';
import { withErrorHandling } from '../utils/errorHandler.js';
import { prisma } from '../config/prisma.js';

const logger = createModuleLogger('treasuryController');

interface WalletTransactionsParams {
    address: string;
}

// Raw handlers without try/catch blocks
const _fetchTreasuryTransactions = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Manual treasury transactions fetch requested');
    await getTreasuryTransactions();
    logger.info('Manual treasury transactions fetch completed successfully');
    res.status(200).json({ message: 'Treasury transactions fetch completed successfully' });
};

const _getTreasuryWallets = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Fetching treasury wallets');
    const treasuryWallets = config.kaspa.treasuryWallets;
    logger.info({ walletCount: treasuryWallets.length }, 'Treasury wallets fetched successfully');
    res.status(200).json(treasuryWallets);
};

const _getWalletTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { address } = req.params as unknown as WalletTransactionsParams;
        logger.info({ address }, 'Fetching treasury transactions for wallet');

        // Verify this is actually a treasury wallet
        if (!config.kaspa.treasuryWallets.some(wallet => wallet.address === address)) {
            logger.warn({ address }, 'Attempted to fetch transactions for non-treasury wallet');
            res.status(403).json({ error: 'Not a treasury wallet' });
            return;
        }

        const transactions = await prisma.treasury_transactions.findMany({
            orderBy: {
                created: 'desc'
            }
        }) as unknown as TreasuryTransaction[];

        logger.info({ address, transactionCount: transactions.length }, 'Treasury transactions fetched successfully');
        res.status(200).json(transactions);
    } catch (error) {
        logger.error({ error, address: req.params.address }, 'Error fetching treasury transactions');
        res.status(500).json({ error: 'Failed to fetch treasury transactions' });
    }
};

// Exported handlers with error handling
export const fetchTreasuryTransactions = withErrorHandling(_fetchTreasuryTransactions, logger);
export const getTreasuryWallets = withErrorHandling(_getTreasuryWallets, logger);
export const getWalletTransactions = withErrorHandling(_getWalletTransactions, logger); 