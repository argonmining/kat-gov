import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';
import * as kasplexAPI from '../services/kasplexAPI.js';
import * as kaspaAPI from '../services/kaspaAPI.js';
import { Decimal } from 'decimal.js';
import cron from 'node-cron';

const prisma = new PrismaClient();
const logger = createModuleLogger('getTreasuryTransactions');

// Add a lock mechanism to prevent concurrent runs
let isTreasuryFetchRunning = false;

interface KasplexTransaction {
    p: string;
    op: string;
    tick: string;
    amt: string;
    from: string;
    to: string;
    opScore: string;
    hashRev: string;
    feeRev: string;
    txAccept: string;
    opAccept: string;
    opError: string;
    checkpoint: string;
    mtsAdd: string;
    mtsMod: string;
}

interface KasplexResponse {
    message: string;
    prev: string;
    next: string;
    result: KasplexTransaction[];
}

async function processKasplexTransaction(tx: KasplexTransaction, walletAddress: string): Promise<boolean> {
    try {
        // Only process transfer operations
        if (tx.op !== 'transfer') {
            return false;
        }

        // Check if transaction already exists
        const existing = await prisma.treasury_transactions.findUnique({
            where: { hash: tx.hashRev }
        });

        if (existing) {
            logger.debug({ hash: tx.hashRev }, 'Transaction already exists');
            return false;
        }

        // Determine transaction direction
        const isSendTransaction = tx.from === walletAddress || (tx.from === walletAddress && tx.to === walletAddress);

        // Process amount: move decimal 8 places left and apply direction
        const amount = new Decimal(tx.amt)
            .div(100000000)
            .mul(isSendTransaction ? -1 : 1);

        // Create new transaction record
        await prisma.treasury_transactions.create({
            data: {
                hash: tx.hashRev,
                type: 'KRC20',
                ticker: tx.tick,
                amount: amount.toNumber(),
                description: `${isSendTransaction ? 'Send' : 'Receive'} transfer from ${tx.from} to ${tx.to}`
            }
        });

        logger.debug({ 
            hash: tx.hashRev, 
            direction: isSendTransaction ? 'send' : 'receive',
            amount: amount.toNumber() 
        }, 'Transaction processed successfully');
        return true;
    } catch (error) {
        logger.error({ error, tx }, 'Error processing transaction');
        return false;
    }
}

async function processKaspaTransaction(tx: kaspaAPI.KaspaTransaction, walletAddress: string): Promise<boolean> {
    try {
        // Only process accepted transactions
        if (!tx.is_accepted) {
            return false;
        }

        // Check if transaction already exists
        const existing = await prisma.treasury_transactions.findUnique({
            where: { hash: tx.transaction_id }
        });

        if (existing) {
            logger.debug({ hash: tx.transaction_id }, 'Transaction already exists');
            return false;
        }

        // Determine if this is a send or receive transaction
        const isSendTransaction = tx.inputs.some((input: kaspaAPI.KaspaTransaction['inputs'][0]) => 
            input.previous_outpoint_address === walletAddress
        );

        // Find the relevant output and amount
        let amount: number | undefined;
        if (isSendTransaction) {
            // For send: find output that doesn't match our address
            const output = tx.outputs.find((out: kaspaAPI.KaspaTransaction['outputs'][0]) => 
                out.script_public_key_address !== walletAddress
            );
            if (output) {
                amount = -new Decimal(output.amount).div(100000000).toNumber();
            }
        } else {
            // For receive: find output that matches our address
            const output = tx.outputs.find((out: kaspaAPI.KaspaTransaction['outputs'][0]) => 
                out.script_public_key_address === walletAddress
            );
            if (output) {
                amount = new Decimal(output.amount).div(100000000).toNumber();
            }
        }

        if (amount === undefined) {
            logger.warn({ tx }, 'Could not determine transaction amount');
            return false;
        }

        // Create new transaction record
        await prisma.treasury_transactions.create({
            data: {
                hash: tx.transaction_id,
                type: 'Kaspa',
                ticker: 'KAS',
                amount: amount,
                description: `${isSendTransaction ? 'Send' : 'Receive'} transaction at block time ${tx.block_time}`
            }
        });

        logger.debug({ hash: tx.transaction_id }, 'Transaction processed successfully');
        return true;
    } catch (error) {
        logger.error({ error, tx }, 'Error processing Kaspa transaction');
        return false;
    }
}

async function fetchAllKasplexTransactions(walletAddress: string): Promise<void> {
    let nextCursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
        try {
            const params: { address: string; tick?: string; next?: string } = {
                address: walletAddress
            };
            if (nextCursor) {
                params.next = nextCursor;
            }

            const response = await kasplexAPI.getKRC20OperationList(params);
            const data = response as KasplexResponse;
            
            // Process each transaction
            for (const tx of data.result) {
                await processKasplexTransaction(tx, walletAddress);
            }

            // Check if there are more transactions
            if (data.next && data.next !== nextCursor) {
                nextCursor = data.next;
            } else {
                hasMore = false;
            }

        } catch (error) {
            logger.error({ error, walletAddress }, 'Error fetching Kasplex transactions');
            hasMore = false;
        }
    }
}

async function fetchAllKaspaTransactions(walletAddress: string): Promise<void> {
    let before: number | undefined;
    let hasMore = true;

    while (hasMore) {
        try {
            const transactions = await kaspaAPI.getAddressTransactions(walletAddress, before);
            
            if (!transactions || transactions.length === 0) {
                hasMore = false;
                continue;
            }

            // Process each transaction
            for (const tx of transactions) {
                await processKaspaTransaction(tx, walletAddress);
            }

            // Get the oldest block_time for pagination
            const oldestTx = transactions.reduce((oldest, tx) => 
                tx.block_time < oldest.block_time ? tx : oldest
            );
            before = oldestTx.block_time;

        } catch (error) {
            logger.error({ error, walletAddress }, 'Error fetching Kaspa transactions');
            hasMore = false;
        }
    }
}

export async function getTreasuryTransactions() {
    if (isTreasuryFetchRunning) {
        logger.warn('Treasury transactions fetch already in progress, skipping');
        return;
    }

    isTreasuryFetchRunning = true;
    try {
        logger.info('Starting treasury transactions fetch');
        
        const treasuryWallets = config.kaspa.treasuryWallets;
        
        for (const wallet of treasuryWallets) {
            logger.info({ walletAddress: wallet.address, walletName: wallet.name }, 'Processing treasury wallet');
            
            try {
                await fetchAllKasplexTransactions(wallet.address);
                await fetchAllKaspaTransactions(wallet.address);
            } catch (error) {
                logger.error({ error, walletAddress: wallet.address, walletName: wallet.name }, 'Error processing wallet');
                continue;
            }
        }
        
        logger.info('Completed treasury transactions fetch');
    } catch (error) {
        logger.error({ error }, 'Error in getTreasuryTransactions');
        throw error;
    } finally {
        isTreasuryFetchRunning = false;
        await prisma.$disconnect();
    }
}

// Run the task after a delay when the application starts
setTimeout(async () => {
    try {
        logger.info('Running initial treasury transactions fetch');
        await getTreasuryTransactions();
        logger.info('Initial treasury transactions fetch completed successfully');
    } catch (error) {
        logger.error({ error }, 'Initial treasury transactions fetch failed');
    }
}, 30 * 60 * 1000); // 30 minutes (30 * 60 seconds * 1000 milliseconds)

// Schedule the task to run every 12 hours (at 0:00 and 12:00)
cron.schedule('0 0,12 * * *', async () => {
    try {
        logger.info('Running scheduled treasury transactions fetch');
        await getTreasuryTransactions();
        logger.info('Scheduled treasury transactions fetch completed successfully');
    } catch (error) {
        logger.error({ error }, 'Scheduled treasury transactions fetch failed');
    }
}); 