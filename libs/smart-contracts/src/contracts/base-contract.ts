import type { ethers } from 'ethers';
import type { TxData } from '.';

export class BaseContract {
  public signer: ethers.Signer | null = null;
  public provider: ethers.providers.Provider;
  public transactions: TxData[] = [];
  public listeners: ((transactions: TxData[]) => void)[] = [];

  constructor(provider: ethers.providers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
  }

  async handleEvent(event: ethers.Event, requiredConfirmations = 1) {
    const tx = await event.getTransaction();
    // start tracking transaction if its not already in the transactions array
    const existing = this.transactions.find((t) => t.tx.hash === tx.hash);
    if (!existing) {
      this.trackTransaction(tx, requiredConfirmations);
    }
  }

  async trackTransaction(
    tx: ethers.providers.TransactionResponse,
    requiredConfirmations = 1
  ) {
    this.mergeTransaction({
      tx,
      receipt: null,
      pending: true,
      requiredConfirmations,
    });

    let receipt = null;

    for (let i = 1; i <= requiredConfirmations; i++) {
      receipt = await tx.wait(i);
      this.mergeTransaction({
        tx,
        receipt,
        pending: true,
        requiredConfirmations,
      });
    }

    this.mergeTransaction({
      tx,
      receipt,
      pending: false,
      requiredConfirmations,
    });
  }

  private mergeTransaction(tx: TxData) {
    this.transactions = [
      // Replace any existing transaction in the array with this one
      ...this.transactions.filter((t) => t.tx.hash !== tx.tx.hash),
      tx,
    ];
    this.emit();
  }

  emit() {
    this.listeners.forEach((ln) => {
      ln(this.transactions);
    });
  }

  listen(cb: (txs: TxData[]) => void) {
    this.listeners.push(cb);
  }
}
