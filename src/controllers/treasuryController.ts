import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createModuleLogger } from '../utils/logger.js';
import { getTreasuryTransactions } from '../scheduler/getTreasuryTransactions.js';
import { config } from '../config/env.js';
import { PrismaClient } from '@prisma/client';
import { TreasuryTransaction } from '../types/treasuryTypes.js';

const prisma = new PrismaClient();
const logger = createModuleLogger('treasuryController');

interface WalletTransactionsParams {
    address: string;
}

export const fetchTreasuryTransactions: RequestHandler = async (req, res, next) => {
    try {
        logger.info('Manual treasury transactions fetch requested');
        await getTreasuryTransactions();
        logger.info('Manual treasury transactions fetch completed successfully');
        res.status(200).json({ message: 'Treasury transactions fetch completed successfully' });
    } catch (error) {
        logger.error({ error }, 'Manual treasury transactions fetch failed');
        next(error);
    }
};

export const getTreasuryWallets: RequestHandler = async (req, res, next) => {
    try {
        logger.info('Fetching treasury wallets');
        const treasuryWallets = config.kaspa.treasuryWallets;
        logger.info({ walletCount: treasuryWallets.length }, 'Treasury wallets fetched successfully');
        res.status(200).json(treasuryWallets);
    } catch (error) {
        logger.error({ error }, 'Error fetching treasury wallets');
        next(error);
    }
};

export const getWalletTransactions: RequestHandler<WalletTransactionsParams> = async (req, res, next) => {
    try {
        const { address } = req.params;
        logger.info({ address }, 'Fetching treasury transactions for wallet');

        // Verify this is actually a treasury wallet
        if (!config.kaspa.treasuryWallets.some(wallet => wallet.address === address)) {
            logger.warn({ address }, 'Attempted to fetch transactions for non-treasury wallet');
            res.status(403).json({ error: 'Not a treasury wallet' });
            return;
        }

        const transactions = await prisma.treasury_transactions.findMany({
            where: {
                OR: [
                    { description: { contains: address } }
                ]
            },
            orderBy: {
                created: 'desc'
            }
        }) as unknown as TreasuryTransaction[];

        logger.info({ address, transactionCount: transactions.length }, 'Treasury transactions fetched successfully');
        res.status(200).json(transactions);
    } catch (error) {
        logger.error({ error }, 'Error fetching treasury transactions');
        next(error);
    } finally {
        await prisma.$disconnect();
    }
}; 