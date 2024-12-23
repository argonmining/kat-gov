import { getEncryptedPrivateKey } from '../models/candidateModels.js';
import { decryptPrivateKey } from '../utils/encryptionUtils.js';
import TransactionSender from '../utils/transactionSender.js';
import { getBalance } from './kaspaAPI.js';
import { getKRC20Balance } from './kasplexAPI.js';
import { RpcClient, Encoding, Resolver, ScriptBuilder, Opcodes, PrivateKey, addressFromScriptPublicKey, createTransactions, kaspaToSompi, sompiToKaspaString } from '../wasm/kaspa/kaspa.js';
import { createModuleLogger } from '../utils/logger.js';
import { config } from '../config/env.js';

const logger = createModuleLogger('burnService');

const BURN_ADDRESS = 'kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e';
const { govAddress: GOV_ADDRESS, network: NETWORK_ID, priorityFeeValue } = config.kaspa;
const { govTokenTicker: ticker } = config.tokens;
const { transaction: timeout } = config.timeouts;

let addedEventTrxId: any;
let SubmittedtrxId: any;

export async function burnKRC20(walletId: number, amount: string): Promise<string> {
    let hash: string | undefined;
    let revealHash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        logger.info('Initializing RPC client');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        logger.debug('RPC client connected');

        // Fetch the encrypted private key
        logger.info({ walletId }, 'Fetching encrypted private key');
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            logger.error({ walletId }, 'No encrypted private key found');
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key and derive address
        logger.debug('Decrypting private key');
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        logger.debug({ address: address.toString() }, 'Address derived from public key');

        // Subscribe to UTXO changes
        logger.info({ address: address.toString() }, 'Subscribing to UTXO changes');
        await RPC.subscribeUtxosChanged([address.toString()]);

        RPC.addEventListener('utxos-changed', async (event: any) => {
            logger.debug('UTXOs changed event received');
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
            }
        });

        const gasFee = 0.3;
        const data = { "p": "krc-20", "op": "transfer", "tick": ticker, "amt": amount.toString(), "to": BURN_ADDRESS };
        logger.debug({ data }, 'Building transaction script');
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
        logger.debug({ P2SHAddress: P2SHAddress.toString() }, 'P2SH Address created');
        
        let eventReceived = false;
        try {
            logger.info({ address: address.toString() }, 'Fetching UTXOs');
            const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
            
            logger.debug('Creating transactions');
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
                logger.info({ hash }, 'Transaction submitted');
                SubmittedtrxId = hash;
            }

            // Set a timeout to handle failure cases
            const commitTimeout = setTimeout(() => {
                if (!eventReceived) {
                    logger.error('Timeout waiting for UTXO change event');
                    process.exit(1);
                }
            }, timeout);

            // Wait until the maturity event has been received
            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            clearTimeout(commitTimeout);

        } catch (initialError) {
            logger.error({ error: initialError }, 'Error during initial transaction creation');
        }

        if (eventReceived) {
            eventReceived = false;
            logger.info('Event received, proceeding with reveal transaction');
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

            for (const transaction of transactions) {
                transaction.sign([privateKey], false);
                const ourOutput = transaction.transaction.inputs.findIndex((input) => input.signatureScript === '');

                if (ourOutput !== -1) {
                    const signature = await transaction.createInputSignature(ourOutput, privateKey);
                    transaction.fillInput(ourOutput, script.encodePayToScriptHashSignatureScript(signature));
                }
                revealHash = await transaction.submit(RPC);
                logger.info({ revealHash }, 'Reveal transaction submitted');
                SubmittedtrxId = revealHash;
            }

            const revealTimeout = setTimeout(() => {
                if (!eventReceived) {
                    logger.error('Timeout waiting for reveal transaction event');
                    process.exit(1);
                }
            }, timeout);

            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            clearTimeout(revealTimeout);

            try {
                const updatedUTXOs = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
                const revealAccepted = updatedUTXOs.entries.some(entry => {
                    const transactionId = entry.entry.outpoint ? entry.entry.outpoint.transactionId : undefined;
                    return transactionId === revealHash;
                });

                if (revealAccepted) {
                    logger.info('Reveal transaction accepted');
                    await RPC.disconnect();
                } else if (!eventReceived) {
                    logger.error('Reveal transaction not accepted');
                }
            } catch (error) {
                logger.error({ error }, 'Error checking reveal transaction acceptance');
            }

        } else {
            logger.error('Event not received, aborting');
        }
    } catch (error) {
        logger.error({ error }, 'Error burning KRC20');
        throw error;
    } finally {
        if (RPC) {
            await RPC.disconnect();
        }
    }
    if (!revealHash) {
        throw new Error('No reveal transaction was submitted.');
    }
    return revealHash;
}

export async function burnKaspa(walletId: number, amount: string): Promise<string> {
    let transactionId: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        logger.info('Initializing RPC client');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        logger.debug('RPC client connected');

        logger.info({ walletId }, 'Fetching encrypted private key');
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            logger.error({ walletId }, 'No encrypted private key found');
            throw new Error('Wallet not found or no private key available.');
        }

        logger.debug('Decrypting private key');
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        logger.debug({ address: address.toString() }, 'Address derived from public key');

        logger.info('Fetching server info');
        const serverInfo = await RPC.getServerInfo();
        if (!serverInfo.isSynced || !serverInfo.hasUtxoIndex) {
            logger.error('Node not synchronized or lacks UTXO index');
            throw new Error('Provided node is either not synchronized or lacks the UTXO index.');
        }

        try {
            logger.info({ amount }, 'Sending transaction');
            const transactionSender = new TransactionSender(NETWORK_ID, privateKey, RPC);
            await new Promise(resolve => setTimeout(resolve, 1000));
            transactionId = await transactionSender.transferFunds(BURN_ADDRESS, amount);
            logger.info({ transactionId }, 'Transaction sent successfully');
        } catch (error) {
            logger.error({ error }, 'Error sending transaction');
            throw error;
        }

    } catch (error) {
        logger.error({ error }, 'Error burning KASPA');
        throw error;
    } finally {
        if (RPC) {
            await RPC.disconnect();
        }
    }
    if (!transactionId) {
        throw new Error('No transaction was submitted.');
    }
    return transactionId;
}

export async function returnGovKaspa(walletId: number): Promise<string> {
    let transactionId: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        console.log('Initializing RPC client...');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        console.log('RPC client connected.');

        // Fetch the encrypted private key
        console.log(`Fetching encrypted private key for walletId: ${walletId}`);
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            console.error(`No encrypted private key found for walletId: ${walletId}`);
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key
        console.log('Decrypting private key...');
        const privateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        console.log(`Address derived from public key: ${address.toString()}`);

        // Get balance and calculate amount
        console.log('Fetching balance...');
        const balanceData = await getBalance(address.toString());
        const balance = sompiToKaspaString(balanceData.balance);
        const amount = parseFloat(balance) - parseFloat(priorityFeeValue);
        console.log(`Calculated amount to return: ${amount}`);

        if (amount <= 0) {
            throw new Error('Insufficient balance to cover the gas fee.');
        }

        // Check server info
        console.log('Fetching server info...');
        const serverInfo = await RPC.getServerInfo();
        if (!serverInfo.isSynced || !serverInfo.hasUtxoIndex) {
            console.error('Provided node is either not synchronized or lacks the UTXO index.');
            throw new Error('Provided node is either not synchronized or lacks the UTXO index.');
        }

        // Send transaction
        try {
            console.log('Sending transaction...');
            const transactionSender = new TransactionSender(NETWORK_ID, privateKey, RPC);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second
            transactionId = await transactionSender.transferFunds(GOV_ADDRESS, amount.toString());
            console.log(`Transaction submitted with ID: ${transactionId}`);
        } catch (error: any) { // Explicitly type the error
            console.error(`Error in transaction sending: ${error.message}`);
            throw error;
        }

        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    } catch (error: any) { // Explicitly type the error
        console.error('Error returning Kaspa to Gov:', error.message || error);
        throw error;
    } finally {
        if (RPC) {
            console.log('Disconnecting RPC client...');
            await RPC.disconnect(); // Ensure disconnection
            console.log('RPC client disconnected.');
        }
    }

    if (!transactionId) {
        throw new Error('No transaction was submitted.');
    }
    return transactionId;
}

export async function dropKasGas(walletId: number): Promise<string> {
    let transactionId: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        console.log('Initializing RPC client...');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        console.log('RPC client connected.');

        // Fetch the encrypted private key
        console.log(`Fetching encrypted private key for walletId: ${walletId}`);
        const encryptedPrivateKey = await getEncryptedPrivateKey(walletId);
        if (!encryptedPrivateKey) {
            console.error(`No encrypted private key found for walletId: ${walletId}`);
            throw new Error('Wallet not found or no private key available.');
        }

        // Decrypt the private key
        console.log('Decrypting private key...');
        const destprivateKeyStr = decryptPrivateKey(encryptedPrivateKey);
        const destprivateKey = new PrivateKey(destprivateKeyStr);
        const destpublicKey = destprivateKey.toPublicKey();
        const destinationAddress = destpublicKey.toAddress(NETWORK_ID);
        console.log(`Address derived from public key: ${destinationAddress.toString()}`);
        const privateKey = new PrivateKey(config.kaspa.govPrivateKey!);
        const amount = '5';

        // Check server info
        console.log('Fetching server info...');
        const serverInfo = await RPC.getServerInfo();
        if (!serverInfo.isSynced || !serverInfo.hasUtxoIndex) {
            console.error('Provided node is either not synchronized or lacks the UTXO index.');
            throw new Error('Provided node is either not synchronized or lacks the UTXO index.');
        }

        // Send transaction
        try {
            console.log('Sending transaction...');
            const transactionSender = new TransactionSender(NETWORK_ID, privateKey, RPC);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second
            transactionId = await transactionSender.transferFunds(destinationAddress.toString(), amount);
            console.log(`Transaction submitted with ID: ${transactionId}`);
        } catch (error: any) { // Explicitly type the error
            console.error(`Error in transaction sending: ${error.message}`);
            throw error;
        }

        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    } catch (error: any) { // Explicitly type the error
        console.error('Error burning Kaspa:', error.message || error);
        throw error;
    } finally {
        if (RPC) {
            console.log('Disconnecting RPC client...');
            await RPC.disconnect(); // Ensure disconnection
            console.log('RPC client disconnected.');
        }
    }

    if (!transactionId) {
        throw new Error('No transaction was submitted.');
    }
    return transactionId;
}

export async function burnYesWallet(): Promise<string> {
    let hash: string | undefined;
    let revealHash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        console.log('Initializing RPC client...');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        console.log('RPC client connected.');

        // Use YES_PRIVATE_KEY from environment variables
        const privateKeyStr = config.kaspa.yesPrivateKey!;
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        console.log(`Address derived from public key: ${address.toString()}`);

        // Get KRC-20 balance
        console.log('Fetching KRC-20 balance...');
        const balanceData = await getKRC20Balance(address.toString(), ticker);
        const amount = balanceData.result[0].balance;
        console.log(`Balance fetched: ${amount}`);

        // Get UTXOs Subscription the wallet address
        console.log('Subscribing to UTXO changes...');
        await RPC.subscribeUtxosChanged([address.toString()]);

        RPC.addEventListener('utxos-changed', async (event: any) => {
            console.log('UTXOs changed event received.');
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
            }
        });

        const gasFee = 0.3;
        const data = { "p": "krc-20", "op": "transfer", "tick": ticker, "amt": amount.toString(), "to": BURN_ADDRESS };
        console.log('Building transaction script...');
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
        console.log(`P2SH Address: ${P2SHAddress.toString()}`);
        let eventReceived = false;
        try {
            console.log('Fetching UTXOs...');
            const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
            console.log('Creating transactions...');
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
                SubmittedtrxId = hash;
            }

            // Set a timeout to handle failure cases
            const commitTimeout = setTimeout(() => {
                if (!eventReceived) {
                    console.error('Timeout waiting for UTXO change event.');
                    process.exit(1);
                }
            }, timeout);

            // Wait until the maturity event has been received
            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500)); // wait and check every 500ms
            }

            clearTimeout(commitTimeout);  // Clear the reveal timeout if the event is received

        } catch (initialError) {
            console.error('Error during initial transaction creation:', initialError);
        }

        if (eventReceived) {
            eventReceived = false;
            console.log('Event received, proceeding with reveal transaction...');
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

            for (const transaction of transactions) {
                transaction.sign([privateKey], false);
                const ourOutput = transaction.transaction.inputs.findIndex((input) => input.signatureScript === '');

                if (ourOutput !== -1) {
                    const signature = await transaction.createInputSignature(ourOutput, privateKey);
                    transaction.fillInput(ourOutput, script.encodePayToScriptHashSignatureScript(signature));
                }
                revealHash = await transaction.submit(RPC);
                console.log(`Reveal transaction submitted with hash: ${revealHash}`);
                SubmittedtrxId = revealHash;
            }
            const revealTimeout = setTimeout(() => {
                if (!eventReceived) {
                    console.error('Timeout waiting for reveal transaction event.');
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
                    console.log('Reveal transaction accepted.');
                    await RPC.disconnect();
                } else if (!eventReceived) { // Check eventReceived here
                    console.error('Reveal transaction not accepted.');
                }
            } catch (error) {
                console.error('Error checking reveal transaction acceptance:', error);
            }

        } else {
            console.error('Event not received, aborting.');
        }
    } catch (error: any) {
        console.error('Error burning KRC20:', error.message || error);
        throw error;
    } finally {
        if (RPC) {
            console.log('Disconnecting RPC client...');
            await RPC.disconnect(); // Ensure disconnection
            console.log('RPC client disconnected.');
        }
    }

    if (!revealHash) {
        throw new Error('No reveal transaction was submitted.');
    }
    return revealHash;
}

export async function burnNoWallet(): Promise<string> {
    let hash: string | undefined;
    let revealHash: string | undefined;
    let RPC: RpcClient | undefined;
    try {
        // Initialize RPC client
        console.log('Initializing RPC client...');
        RPC = new RpcClient({
            resolver: new Resolver(),
            encoding: Encoding.Borsh,
            networkId: NETWORK_ID
        });
        await RPC.disconnect();
        await RPC.connect();
        console.log('RPC client connected.');

        // Use NO_PRIVATE_KEY from environment variables
        const privateKeyStr = config.kaspa.noPrivateKey!;
        const privateKey = new PrivateKey(privateKeyStr);
        const publicKey = privateKey.toPublicKey();
        const address = publicKey.toAddress(NETWORK_ID);
        console.log(`Address derived from public key: ${address.toString()}`);

        // Get KRC-20 balance
        console.log('Fetching KRC-20 balance...');
        const balanceData = await getKRC20Balance(address.toString(), ticker);
        const amount = balanceData.result[0].balance;
        console.log(`Balance fetched: ${amount}`);

        // Get UTXOs Subscription the wallet address
        console.log('Subscribing to UTXO changes...');
        await RPC.subscribeUtxosChanged([address.toString()]);

        RPC.addEventListener('utxos-changed', async (event: any) => {
            console.log('UTXOs changed event received.');
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
            }
        });

        const gasFee = 0.3;
        const data = { "p": "krc-20", "op": "transfer", "tick": ticker, "amt": amount.toString(), "to": BURN_ADDRESS };
        console.log('Building transaction script...');
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
        console.log(`P2SH Address: ${P2SHAddress.toString()}`);
        let eventReceived = false;
        try {
            console.log('Fetching UTXOs...');
            const { entries } = await RPC.getUtxosByAddresses({ addresses: [address.toString()] });
            console.log('Creating transactions...');
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
                SubmittedtrxId = hash;
            }

            // Set a timeout to handle failure cases
            const commitTimeout = setTimeout(() => {
                if (!eventReceived) {
                    console.error('Timeout waiting for UTXO change event.');
                    process.exit(1);
                }
            }, timeout);

            // Wait until the maturity event has been received
            while (!eventReceived) {
                await new Promise(resolve => setTimeout(resolve, 500)); // wait and check every 500ms
            }

            clearTimeout(commitTimeout);  // Clear the reveal timeout if the event is received

        } catch (initialError) {
            console.error('Error during initial transaction creation:', initialError);
        }

        if (eventReceived) {
            eventReceived = false;
            console.log('Event received, proceeding with reveal transaction...');
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

            for (const transaction of transactions) {
                transaction.sign([privateKey], false);
                const ourOutput = transaction.transaction.inputs.findIndex((input) => input.signatureScript === '');

                if (ourOutput !== -1) {
                    const signature = await transaction.createInputSignature(ourOutput, privateKey);
                    transaction.fillInput(ourOutput, script.encodePayToScriptHashSignatureScript(signature));
                }
                revealHash = await transaction.submit(RPC);
                console.log(`Reveal transaction submitted with hash: ${revealHash}`);
                SubmittedtrxId = revealHash;
            }
            const revealTimeout = setTimeout(() => {
                if (!eventReceived) {
                    console.error('Timeout waiting for reveal transaction event.');
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
                    console.log('Reveal transaction accepted.');
                    await RPC.disconnect();
                } else if (!eventReceived) { // Check eventReceived here
                    console.error('Reveal transaction not accepted.');
                }
            } catch (error) {
                console.error('Error checking reveal transaction acceptance:', error);
            }

        } else {
            console.error('Event not received, aborting.');
        }
    } catch (error: any) {
        console.error('Error burning KRC20:', error.message || error);
        throw error;
    } finally {
        if (RPC) {
            console.log('Disconnecting RPC client...');
            await RPC.disconnect(); // Ensure disconnection
            console.log('RPC client disconnected.');
        }
    }

    if (!revealHash) {
        throw new Error('No reveal transaction was submitted.');
    }
    return revealHash;
}