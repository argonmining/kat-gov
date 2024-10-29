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
  // Set the network from environment variable or default to 'testnet-10'
  const network = process.env.KASPA_NETWORK || 'testnet-10';
  
  // Generate a new mnemonic phrase for wallet creation
  const mnemonic = Mnemonic.random();
  const seed = mnemonic.toSeed();
  
  // Derive the private key and public address using Kaspa WASM
  const xprv = new XPrv(seed);
  const privateKey = xprv.derivePath("m/44'/111111'/0'/0/0").toPrivateKey(); // First address path
  const publicKey = privateKey.toPublicKey();
  const address = publicKey.toAddress(network).toString();
  
  // Encrypt the private key for secure storage
  const encryptedPrivateKey = encryptPrivateKey(privateKey.toString());

  return {
    mnemonic: mnemonic.phrase,
    encryptedPrivateKey,
    address,
  };
}