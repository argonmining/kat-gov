import { Decimal } from '@prisma/client/runtime/library';

export interface CandidateNomination {
  id: number;
  created: Date;
  hash: string | null;
  toaddress: string;
  amountsent: Decimal;
  validvote: boolean;
  candidate_id: number;
}

export interface CandidateWallet {
  id: number;
  address: string;
  encryptedprivatekey: string;
  balance: Decimal;
  created: Date;
  active: boolean;
  candidate_id: number | null;
}

export interface CandidateStatus {
  id: number;
  name: string;
  active: boolean;
} 