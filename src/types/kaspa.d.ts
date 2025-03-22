declare module '../wasm/kaspa/kaspa' {
    export interface IUtxoProcessorEvent<T extends keyof UtxoProcessorEventMap> {
        type: T;
        data: UtxoProcessorEventMap[T];
    }

    export interface UtxoProcessorEventMap {
        'error': IErrorEvent;
        'balance': IBalanceEvent;
        'connect': IConnectEvent;
        'disconnect': IDisconnectEvent;
        'utxo-index-not-enabled': IUtxoIndexNotEnabledEvent;
        'sync-state': ISyncStateEvent;
        'server-status': IServerStatusEvent;
        'utxo-proc-error': IUtxoProcErrorEvent;
        'daa-score-change': IDaaScoreChangeEvent;
        'discovery': IDiscoveryEvent;
    }

    export interface IErrorEvent {
        error: string;
    }

    export interface IBalanceEvent {
        balance: bigint;
    }

    export interface IConnectEvent {
        connected: boolean;
    }

    export interface IDisconnectEvent {
        disconnected: boolean;
    }

    export interface IUtxoIndexNotEnabledEvent {
        enabled: boolean;
    }

    export interface ISyncStateEvent {
        synced: boolean;
    }

    export interface IServerStatusEvent {
        status: string;
    }

    export interface IUtxoProcErrorEvent {
        error: string;
    }

    export interface IDaaScoreChangeEvent {
        daaScore: bigint;
    }

    export interface IDiscoveryEvent {
        addresses: string[];
    }

    export interface IUtxoEntry {
        address?: string;
        outpoint: {
            transactionId: string;
            index: number;
        };
        amount: bigint;
        scriptPublicKey: {
            version: number;
            script: string;
        };
        blockDaaScore: bigint;
        isCoinbase: boolean;
    }

    export interface ITransactionRecord {
        transactionId: string;
        blockTime: bigint;
        blockHash: string;
        inputs: Array<{
            previousOutpoint: {
                transactionId: string;
                index: number;
            };
            signatureScript?: string;
            sequence: bigint;
            sigOpCount: number;
        }>;
        outputs: Array<{
            value: bigint;
            scriptPublicKey: {
                version: number;
                script: string;
            };
        }>;
    }

    export interface IUtxoContext {
        trackAddresses(addresses: string[], options?: any): Promise<void>;
        untrackAddresses(addresses: string[]): Promise<void>;
        getUtxos(): Promise<IUtxoEntry[]>;
        getTransactions(): Promise<ITransactionRecord[]>;
    }

    export interface IUtxoProcessor {
        start(): Promise<void>;
        stop(): Promise<void>;
        addEventListener(callback: (event: IUtxoProcessorEvent<keyof UtxoProcessorEventMap>) => void): void;
        removeEventListener(callback: (event: IUtxoProcessorEvent<keyof UtxoProcessorEventMap>) => void): void;
        clearEventListener(): void;
        removeAllEventListeners(): void;
    }

    export interface IRpcClient {
        connect(): Promise<void>;
        disconnect(): void;
        getServerInfo(): Promise<{
            isSynced: boolean;
            hasUtxoIndex: boolean;
            virtualDaaScore: bigint;
        }>;
    }

    export interface IResolver {
        getNode(networkId: string): string;
        getUrl(networkId: string): string;
    }

    export interface IPrivateKey {
        toKeypair(): {
            toAddress(networkId: string): string;
        };
    }

    export interface IAddress {
        toString(): string;
    }

    export interface IUtxoProcessorOptions {
        rpc: IRpcClient;
        networkId: string;
    }

    export interface IUtxoContextOptions {
        processor: IUtxoProcessor;
    }

    export class RpcClient implements IRpcClient {
        constructor(options: { resolver: IResolver; encoding: string; networkId: string });
        connect(): Promise<void>;
        disconnect(): void;
        getServerInfo(): Promise<{
            isSynced: boolean;
            hasUtxoIndex: boolean;
            virtualDaaScore: bigint;
        }>;
    }

    export class Resolver implements IResolver {
        getNode(networkId: string): string;
        getUrl(networkId: string): string;
    }

    export class PrivateKey implements IPrivateKey {
        constructor(privateKey: string);
        toKeypair(): {
            toAddress(networkId: string): string;
        };
    }

    export class Address implements IAddress {
        constructor(address: string);
        toString(): string;
    }

    export class UtxoProcessor implements IUtxoProcessor {
        constructor(options: IUtxoProcessorOptions);
        start(): Promise<void>;
        stop(): Promise<void>;
        addEventListener(callback: (event: IUtxoProcessorEvent<keyof UtxoProcessorEventMap>) => void): void;
        removeEventListener(callback: (event: IUtxoProcessorEvent<keyof UtxoProcessorEventMap>) => void): void;
        clearEventListener(): void;
        removeAllEventListeners(): void;
    }

    export class UtxoContext implements IUtxoContext {
        constructor(options: IUtxoContextOptions);
        trackAddresses(addresses: string[], options?: any): Promise<void>;
        untrackAddresses(addresses: string[]): Promise<void>;
        getUtxos(): Promise<IUtxoEntry[]>;
        getTransactions(): Promise<ITransactionRecord[]>;
    }

    export function initConsolePanicHook(): void;
    export function kaspaToSompi(kaspa: string): bigint;
    export function createTransactions(settings: any): Promise<any>;
} 