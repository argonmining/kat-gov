// src/services/chaingeFinanceAPI.ts
import axios from 'axios';
import dotenv from 'dotenv';
import process from 'process';

const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

const CHAINGE_FINANCE_API_URL = 'https://api.chainge.finance';

export async function swapKRC20ToKASPA(amount: number, sourceWallet: string, destinationWallet: string): Promise<any> {
  try {
    const response = await axios.post(`${CHAINGE_FINANCE_API_URL}/order`, {
      source_currency: 'process.env.GOV_TOKEN_TICKER',
      target_currency: 'KAS',
      source_amount: amount,
      from_wallet: sourceWallet,
      to_wallet: destinationWallet,
    });
    return response.data;
  } catch (error) {
    console.error('Error swapping KRC20 to KASPA:', error);
    throw error;
  }
}
