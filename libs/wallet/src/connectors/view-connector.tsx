import type { PubKey, TransactionResponse, VegaConnector } from './vega-connector';

export class ViewConnector implements VegaConnector {
    url: string | null;
    pubkey: string | null = null;
    /**
     *
     */
    constructor() {
        this.url = 'view-only'
    }
    setPubkey(pubkey: string) {
        this.pubkey = pubkey
    }
    connect(): Promise<PubKey[] | null> {
        if (!this.pubkey) {
            throw new Error('Cannot connect until address is set first')
        }
        return Promise.resolve([{
            name: 'View only address',
            publicKey: this.pubkey
        }])
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    sendTx(): Promise<TransactionResponse | null> {
        throw new Error('View only connector cannot be used to send transactions')
    }
}