import { RpcClient, IGetBalanceByAddressRequest } from "../wasm/kaspa/kaspa.js";
import { createModuleLogger } from '../utils/logger.js';
import { NETWORK_ID } from '../config/env.js';

const logger = createModuleLogger('kasBalance');

class BalanceChecker {
  private address: string;
  private rpcClient: RpcClient;
  private network: string;

  constructor(address: string, rpcClient: RpcClient, network: string = NETWORK_ID) {
    this.address = address;
    this.rpcClient = rpcClient;
    this.network = network;
    logger.debug({ address, network }, 'BalanceChecker initialized');
  }

  // Method to get the balance of the address
  public async getBalance(): Promise<string> {
    const balanceRequest: IGetBalanceByAddressRequest = {
      address: this.address,
    };

    try {
      logger.info({ address: this.address }, 'Fetching balance');
      const balance = await this.rpcClient.getBalanceByAddress(balanceRequest);
      logger.debug({ address: this.address, balance }, 'Balance retrieved successfully');
      return String(balance);
    } catch (error) {
      logger.error({ error, address: this.address }, 'Error fetching balance');
      throw error; // Re-throw the error to be handled by a centralized error handler
    }
  }
}

export default BalanceChecker;


