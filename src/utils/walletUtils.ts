import { Mnemonic, XPrv } from '../wasm/kaspa/kaspa.js';
import { encryptPrivateKey } from './encryptionUtils.js';
import dotenv from 'dotenv';

dotenv.config();

interface WalletDetails {
  mnemonic: string;
  encryptedPrivateKey: string;
  address: string;
}

export async function createKaspaWallet(): Promise<WalletDetails> {
  const network = process.env.KASPA_NETWORK || 'testnet-10';
  
  const mnemonic = Mnemonic.random();
  const seed = mnemonic.toSeed();
  
  const xprv = new XPrv(seed);
  const privateKey = xprv.derivePath("m/44'/111111'/0'/0/0").toPrivateKey();
  const publicKey = privateKey.toPublicKey();
  const address = publicKey.toAddress(network).toString();
  
  const encryptedPrivateKey = encryptPrivateKey(privateKey.toString());

  return {
    mnemonic: mnemonic.phrase,
    encryptedPrivateKey,
    address,
  };
}