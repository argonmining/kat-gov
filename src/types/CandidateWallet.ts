export interface CandidateWallet {
  id: number;
  address: string;
  encryptedPrivateKey: string;
  balance: number;
  created: Date;
  active: boolean;
} 