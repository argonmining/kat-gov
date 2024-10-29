import { RpcClient, IGetBalanceByAddressRequest } from "../wasm/kaspa/kaspa.js";

class BalanceChecker {
  private address: string;
  private rpcClient: RpcClient;
  private network: string;

  constructor(address: string, rpcClient: RpcClient, network: string = 'testnet-11') {
    this.address = address;
    this.rpcClient = rpcClient;
    this.network = network;
  }

  // Method to get the balance of the address
  public async getBalance(): Promise<string> {
    const balanceRequest: IGetBalanceByAddressRequest = {
      address: this.address,
    };

    try {
      const balance = await this.rpcClient.getBalanceByAddress(balanceRequest);
      return String(balance);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching balance: ${error.message}`);
      } else {
        console.error('Unknown error fetching balance');
      }
      throw error; // Re-throw the error to be handled by a centralized error handler
    }
  }
}


