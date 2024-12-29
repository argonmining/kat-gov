import { Decimal } from '@prisma/client/runtime/library';

export interface TreasuryTransaction {
    id: number;
    hash: string;
    type: string;
    ticker: string;
    amount: number;
    description: string;
    created?: Date;
} 