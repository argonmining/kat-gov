import { Mnemonic, XPrv } from '../wasm/kaspa/kaspa.js';
import { encryptPrivateKey } from './encryptionUtils.js';
import { createModuleLogger } from './logger.js';
import dotenv from 'dotenv';
import process from 'process';

const logger = createModuleLogger('walletUtils');
const envFile = process.env.NODE_ENV === 'katgov' ? '.env.katgov' : '.env.kdao';
dotenv.config({ path: envFile });

interface WalletDetails {
  mnemonic: string;
  encryptedPrivateKey: string;
  address: string;
}

export async function createKaspaWallet(): Promise<WalletDetails> {
  try {
    const network = process.env.KASPA_NETWORK || 'testnet-10';
    logger.info({ network }, 'Creating new Kaspa wallet');
    
    const mnemonic = Mnemonic.random();
    const seed = mnemonic.toSeed();
    
    const xprv = new XPrv(seed);
    const privateKey = xprv.derivePath("m/44'/111111'/0'/0/0").toPrivateKey();
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress(network).toString();
    
    const encryptedPrivateKey = encryptPrivateKey(privateKey.toString());
    logger.info({ address }, 'Kaspa wallet created successfully');

    return {
      mnemonic: mnemonic.phrase,
      encryptedPrivateKey,
      address,
    };
  } catch (error) {
    logger.error({ error }, 'Error creating Kaspa wallet');
    throw error;
  }
}