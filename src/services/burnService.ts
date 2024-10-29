import { getEncryptedPrivateKey } from '../models/DynamicWallet.js';
import { decryptPrivateKey } from '../utils/encryptionUtils.js';
import { RpcClient, Encoding, Resolver, ScriptBuilder, Opcodes, PrivateKey, addressFromScriptPublicKey, createTransactions, kaspaToSompi, UtxoProcessor, UtxoContext } from '../wasm/kaspa/kaspa.js';

const BURN_ADDRESS = 'kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e';
const NETWORK_ID = process.env.KASPA_NETWORK || 'testnet-10';
const ticker = process.env.TICKER || 'KNACHO';
const priorityFeeValue = process.env.PRIORITY_FEE_VALUE || '1.5';
const timeout = parseInt(process.env.TIMEOUT || '120000', 10);

let addedEventTrxId: any;
let SubmittedtrxId: any;

export async function burnKRC20(walletId: number, amount: string): Promise<string> {
    let hash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();

        // Fetch the encrypted private key
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);

        // Get UTXOs Subscription the wallet address
        await RPC.subscribeUtxosChanged([address.toString()]);
        RPC.addEventListener('utxos-changed', async (event: any) => {
            // Check for UTXOs removed for the specific address
            const removedEntry = event.data.removed.find((entry: any) =>
                entry.address.payload === address.toString().split(':')[1]
            );
            const addedEntry = event.data.added.find((entry: any) =>
                entry.address.payload === address.toString().split(':')[1]
            );
            if (removedEntry) {
                addedEventTrxId = addedEntry.outpoint.transactionId;
                if (addedEventTrxId == SubmittedtrxId) {
                    eventReceived = true;
                }
            } else {
            }
        });

        const gasFee = 0.3
        const data = { "p": "krc-20", "op": "transfer", "tick": ticker, "amt": amount.toString(), "to": BURN_ADDRESS };

        const script = new ScriptBuilder()
            .addData(publicKey.toXOnlyPublicKey().toString())
            .addOp(Opcodes.OpCheckSig)
            .addOp(Opcodes.OpFalse)
            .addOp(Opcodes.OpIf)
            .addData(Buffer.from("kasplex"))
            .addI64(0n)
            .addData(Buffer.from(JSON.stringify(data, null, 0)))
            .addOp(Opcodes.OpEndIf);

        const P2SHAddress = addressFromScriptPublicKey(script.createPayToScriptHashScript(), NETWORK_ID)!;
        let eventReceived = false;
        try {
            const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
            const { transactions } = await createTransactions({
                priorityEntries: [],
                entries,
                outputs: [{
                    address: P2SHAddress.toString(),
                    amount: kaspaToSompi("0.3")!
                }],
                changeAddress: address.toString(),
                priorityFee: kaspaToSompi(priorityFeeValue.toString())!,
                networkId: NETWORK_ID
            });

            for (const transaction of transactions) {
                transaction.sign([privateKey]);
                hash = await transaction.submit(RPC);
                console.log(`Transaction submitted with hash: ${hash}`);
            }

            // Set a timeout to handle failure cases
            const commitTimeout = setTimeout(() => {
                if (!eventReceived) {
                    process.exit(1);
                }
            }, timeout);

            // Wait until the maturity event has been received
            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500)); // wait and check every 500ms
            }

            clearTimeout(commitTimeout);  // Clear the reveal timeout if the event is received

        } catch (initialError) {
        }

        if (eventReceived) {
            eventReceived = false;
            const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
            const revealUTXOs = await RPC.getUtxosByAddresses({ addresses: [P2SHAddress.toString()] });

            const { transactions } = await createTransactions({
                priorityEntries: [revealUTXOs.entries[0]],
                entries: entries,
                outputs: [],
                changeAddress: address.toString(),
                priorityFee: kaspaToSompi(gasFee.toString())!,
                networkId: NETWORK_ID
            });
            let revealHash: any;

            for (const transaction of transactions) {
                transaction.sign([privateKey], false);
                const ourOutput = transaction.transaction.inputs.findIndex((input) => input.signatureScript === '');

                if (ourOutput !== -1) {
                    const signature = await transaction.createInputSignature(ourOutput, privateKey);
                    transaction.fillInput(ourOutput, script.encodePayToScriptHashSignatureScript(signature));
                }
                revealHash = await transaction.submit(RPC);
                SubmittedtrxId = revealHash;
            }
            const revealTimeout = setTimeout(() => {
                if (!eventReceived) {
                    process.exit(1);
                }
            }, timeout);

            // Wait until the maturity event has been received
            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500)); // wait and check every 500ms
            }

            clearTimeout(revealTimeout);  // Clear the reveal timeout if the event is received          

            try {
                // Fetch the updated UTXOs
                const updatedUTXOs = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });

                // Check if the reveal transaction is accepted
                const revealAccepted = updatedUTXOs.entries.some(entry => {
                    const transactionId = entry.entry.outpoint ? entry.entry.outpoint.transactionId : undefined;
                    return transactionId === revealHash;
                });

                // If reveal transaction is accepted
                if (revealAccepted) {
                    await RPC.disconnect();
                } else if (!eventReceived) { // Check eventReceived here
                }
            } catch (error) {
            }

        } else {
        }
    } catch (error) {
        console.error('Error burning KRC20:', error);
        throw error;
    } finally {
        if (RPC) {
            await RPC.disconnect(); // Ensure disconnection
        }
    }
    if (!hash) {
        throw new Error('No transaction was submitted.');
    }
    return hash;
}

export async function burnKaspa(walletId: number, amount: string): Promise<string> {
    let hash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();

        // Fetch the encrypted private key
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);

        // Get UTXOs for the wallet address
        const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });

        // Create and sign the transaction
        const { transactions } = await createTransactions({
            entries,
            outputs: [{ address: BURN_ADDRESS, amount: kaspaToSompi(amount)! }],
            changeAddress: address.toString(),
            priorityFee: kaspaToSompi("0.3")
        });

        for (const transaction of transactions) {
            transaction.sign([privateKey]);
            hash = await transaction.submit(RPC);
            console.log(`Kaspa burned with transaction hash: ${hash}`);
        }
    } catch (error) {
        console.error('Error in burnKaspa:', error);
        throw error;
    } finally {
        if (RPC) {
            await RPC.disconnect(); // Ensure disconnection
        }
    }
    if (!hash) {
        throw new Error('No transaction was submitted.');
    }
    return hash;
}

export async function returnGovKaspa(walletId: number, amount: string): Promise<string> {
    let hash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();

        // Fetch the encrypted private key
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        const govAddress = privateKey.toPublicKey().toAddress(NETWORK_ID).toString()

        // Get UTXOs for the wallet address
        const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });

        // Create and sign the transaction
        const { transactions } = await createTransactions({
            entries,
            outputs: [{ address: govAddress, amount: kaspaToSompi(amount)! }],
            changeAddress: address.toString(),
            priorityFee: kaspaToSompi("0.3")
        });

        for (const transaction of transactions) {
            transaction.sign([privateKey]);
            hash = await transaction.submit(RPC);
            console.log(`Kaspa returned to the gov wallet with transaction hash: ${hash}`);
        }
    } catch (error) {
        console.error('Error in returnGovKaspa:', error);
        throw error;
    } finally {
        if (RPC) {
            await RPC.disconnect(); // Ensure disconnection
        }
    }
    if (!hash) {
        throw new Error('No transaction was submitted.');
    }
    return hash;
}