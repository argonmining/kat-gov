import { EventEmitter } from 'events'
import { kaspaToSompi, type IPaymentOutput, createTransactions, PrivateKey, UtxoProcessor, UtxoContext, type RpcClient } from "../wasm/kaspa/kaspa.js";
import { createModuleLogger } from './logger.js';

const logger = createModuleLogger('transactionSender');

export default class TransactionSender extends EventEmitter {
  private networkId: string;
  private privateKey: PrivateKey;
  private processor: UtxoProcessor;
  private context: UtxoContext;
  private rpc: RpcClient;



  constructor(networkId: string, privKey: PrivateKey, rpc: RpcClient) {
    super()
    this.networkId = networkId;
    this.privateKey = privKey;
    this.processor = new UtxoProcessor({ rpc, networkId });
    this.rpc = this.processor.rpc
    this.context = new UtxoContext({ processor: this.processor });
    this.registerProcessor()
  }

  async transferFunds(address: string, amount: string) {
    logger.info({ address, amount }, 'Creating transaction for fund transfer');

    let payments: IPaymentOutput[] = [{
      address: address,
      amount: kaspaToSompi(amount)!
    }];

    const transactionId = await this.send(payments);
    logger.info({ transactionId }, 'Funds transfer completed');

    return transactionId;
  }

  async send(outputs: IPaymentOutput[]) {
    let context = this.context
    logger.debug({ outputs }, 'Processing transaction outputs');
    
    const { transactions, summary } = await createTransactions({
      entries: context,
      outputs,
      changeAddress: this.privateKey.toPublicKey().toAddress(this.networkId).toString(),
      priorityFee: kaspaToSompi("0.02")
    });

    logger.debug({ transactionCount: transactions.length }, 'Transactions created');

    // Handle the first transaction immediately
    if (transactions.length > 0) {
      const firstTransaction = transactions[0];
      logger.info({ transactionId: firstTransaction.id }, 'Signing and submitting first transaction');
      
      firstTransaction.sign([this.privateKey]);
      await firstTransaction.submit(this.rpc);
    }
  
    // Handle the remaining transactions, waiting for the `time-to-submit` event
    for (let i = 1; i < transactions.length; i++) {
      const transaction = transactions[i];
      logger.info({ transactionId: transaction.id, index: i }, 'Signing and submitting subsequent transaction');
      transaction.sign([this.privateKey]);
      await transaction.submit(this.rpc);
    }
  
    return summary.finalTransactionId;
  }
  


  private registerProcessor () {
    this.processor.addEventListener("utxo-proc-start", async () => {
      logger.debug('Clearing context');
      await this.context.clear()
      
      const poolAddress = this.privateKey.toPublicKey().toAddress(this.networkId).toString();
      logger.debug({ poolAddress }, 'Tracking pool address');
      await this.context.trackAddresses([ poolAddress ])
    })
    this.processor.start()
  }  

}