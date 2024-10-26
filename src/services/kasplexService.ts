import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const BASE_URL = process.env.KASPLEX_API_BASE_URL;

/**
 * Get the balance of a KRC-20 token for a specific address.
 * @param address - The address to check the balance for.
 * @param tick - The token symbol.
 * @returns The balance information.
 */
export async function getKRC20Balance(address: string, tick: string): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/address/${address}/token/${tick}`);
    return response.data.result;
  } catch (error) {
    console.error('Error in getKRC20Balance:', error);
    throw error;
  }
}

/**
 * Get the list of KRC-20 operations.
 * @returns The list of operations.
 */
export async function getKRC20OperationList(): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/oplist`);
    return response.data.result;
  } catch (error) {
    console.error('Error in getKRC20OperationList:', error);
    throw error;
  }
}

/**
 * Get details of a specific KRC-20 operation.
 * @param id - The operation ID.
 * @returns The operation details.
 */
export async function getKRC20OperationDetails(id: string): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/op/${id}`);
    return response.data.result;
  } catch (error) {
    console.error('Error in getKRC20OperationDetails:', error);
    throw error;
  }
}

/**
 * Get information about a specific KRC-20 token.
 * @param tick - The token symbol.
 * @returns The token information.
 */
export async function getKRC20Info(tick: string): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/token/${tick}`);
    return response.data.result;
  } catch (error) {
    console.error('Error in getKRC20Info:', error);
    throw error;
  }
}
