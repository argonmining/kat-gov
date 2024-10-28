import { Mnemonic, XPrv } from '../wasm/kaspa';
import { encryptPrivateKey } from './encryptionUtils.js';

interface WalletDetails {
  mnemonic: string;
  encryptedPrivateKey: string;
  address: string;
}

export async function createKaspaWallet(network: string = 'testnet-10'): Promise<WalletDetails> {
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