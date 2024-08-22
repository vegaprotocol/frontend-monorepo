import { create } from 'zustand';

import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider';
import { RpcMethods } from '@/lib/client-rpc-methods';
import type { Transaction, TransactionMessage } from '@/lib/transactions';
import type { CheckTransactionResponse } from '@/types/backend';

export interface ConnectionMessage {
  origin: string;
  chainId: string;
  receivedAt: string;
}

export interface ConnectionReply {
  approved: boolean;
  networkId?: string;
}

export type InteractionStore = {
  transactionModalOpen: boolean;
  handleTransaction: (parameters: TransactionMessage) => Promise<boolean>;
  handleTransactionDecision: (decision: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  transactionPromise: [Function, Function] | null;
  currentTransactionDetails: TransactionMessage | null;
  checkTransaction: (
    request: SendMessage,
    transaction: Transaction,
    publicKey: string,
    origin: string
  ) => Promise<CheckTransactionResponse>;
};

export const useInteractionStore = create<InteractionStore>()((set, get) => ({
  transactionModalOpen: false,
  currentTransactionDetails: null,
  transactionPromise: null,
  handleTransactionDecision: (decision: boolean) => {
    const promise = get().transactionPromise;
    if (promise) {
      promise[0](decision);
    }
    set({
      transactionPromise: null,
      currentTransactionDetails: null,
      transactionModalOpen: false,
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleTransaction: async (parameters: any) => {
    set({
      transactionModalOpen: true,
    });
    const transactionPromise = new Promise<boolean>((resolve, reject) => {
      set({
        currentTransactionDetails: parameters,
        transactionPromise: [resolve, reject],
      });
    });
    const result = await transactionPromise;
    return result;
  },
  checkTransaction: async (
    request: SendMessage,
    transaction: Transaction,
    publicKey: string,
    origin: string
  ) => {
    const result = await request(
      RpcMethods.CheckTransaction,
      {
        transaction,
        publicKey,
        origin,
      },
      true
    );
    return result;
  },
}));
