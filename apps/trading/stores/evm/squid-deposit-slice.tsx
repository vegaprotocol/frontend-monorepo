import { type AssetERC20 } from '@vegaprotocol/assets';
import { type StoreApi } from 'zustand';
import { switchChain, getChainId, getConnectorClient } from '@wagmi/core';

import * as Toasts from '../../components/toasts';
import { getApolloClient } from '../../lib/apollo-client';
import { wagmiConfig } from '../../lib/wagmi-config';
import { type DefaultSlice, type TxCommon } from './evm';
import { Intent, useToasts } from '@vegaprotocol/ui-toolkit';
import {
  DepositBusEventDocument,
  type DepositBusEventSubscription,
  type DepositBusEventSubscriptionVariables,
} from '@vegaprotocol/web3';
import { DepositStatus } from '@vegaprotocol/types';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { queryClient } from '../../lib/query-client';
import { type Squid } from '@0xsquid/sdk';
import { type ethers } from 'ethers';
import { clientToSigner } from '../../lib/hooks/use-ethers-signer';

type SquidDepositConfig = {
  asset: AssetERC20;
  amount: string;
  toPubKey: string;
  routeData: RouteResponse | null | undefined;
  requiredConfirmations?: number;
  chainId: number;
};

export type TxSquidDeposit = Omit<TxCommon, 'status'> & {
  kind: 'squidDepositAsset';
  status: TxCommon['status'] | 'complete';
  asset: AssetERC20;
  amount: string;
  toPubKey: string;
  routeData: RouteResponse;
  error?: Error;
  hash?: string;
  receipt?: ethers.providers.TransactionReceipt;
};

export type SquidDepositSlice = {
  squidDeposit: (
    id: string,
    config: SquidDepositConfig
  ) => Promise<TxSquidDeposit>;
};

export const createEvmSquidDepositSlice = (
  set: StoreApi<SquidDepositSlice & DefaultSlice>['setState'],
  get: StoreApi<SquidDepositSlice & DefaultSlice>['getState']
) => ({
  squidDeposit: async (id: string, config: SquidDepositConfig) => {
    try {
      const squid = queryClient.getQueryData<Squid>(['squid']);
      const client = await getConnectorClient(wagmiConfig);
      const signer = clientToSigner(client);

      if (!signer) {
        throw new Error('no signer');
      }

      if (!squid) {
        throw new Error('squid not initialized');
      }

      if (!config.routeData) {
        throw new Error('no route');
      }

      const route = config.routeData.route;
      const requiredConfirmations = config.requiredConfirmations || 1;

      const tx: TxSquidDeposit = {
        kind: 'squidDepositAsset',
        id,
        status: 'idle',
        asset: config.asset,
        amount: config.amount,
        toPubKey: config.toPubKey,
        routeData: config.routeData,
        confirmations: 0,
        requiredConfirmations,
        chainId: config.chainId,
      };

      get().setTx(id, tx);
      const chainId = getChainId(wagmiConfig);

      if (route.params.fromChain !== String(chainId)) {
        get().setTx(id, { status: 'switch' });
        useToasts.getState().setToast({
          id,
          intent: Intent.Warning,
          content: <p>Switch chain</p>,
        });

        await switchChain(wagmiConfig, {
          chainId: Number(route.params.fromChain),
        });
      }

      get().setTx(id, { status: 'requested' });
      useToasts.getState().setToast({
        id,
        intent: Intent.Warning,
        content: <p>Confirm deposit</p>,
      });

      const routeTx = (await squid?.executeRoute({
        signer,
        route,
      })) as unknown as ethers.providers.TransactionResponse;

      get().setTx(id, { hash: routeTx.hash, status: 'pending' });
      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Pending deposit</p>,
      });

      const receipt = await routeTx.wait();

      get().setTx(id, { receipt, status: 'complete' });

      useToasts.getState().update(id, {
        intent: Intent.Warning,
        content: <p>Processing deposit</p>,
      });

      await waitForDepositEvent(config);

      get().setTx(id, { status: 'finalized' });
      useToasts.getState().update(id, {
        intent: Intent.Success,
        content: (
          <Toasts.FinalizedDeposit tx={get().txs.get(id) as TxSquidDeposit} />
        ),
        loader: false,
      });

      return get().txs.get(id) as TxSquidDeposit;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('deposit failed');
      get().setTx(id, {
        status: 'error',
        error,
      });

      useToasts.getState().update(id, {
        content: <Toasts.Error message={error.message} />,
        intent: Intent.Danger,
        loader: false,
      });
    }

    return get().txs.get(id) as TxSquidDeposit;
  },
});

/**
 * Start a subscription and find the next deposit for the current pubkey and asset
 * We can't check Deposit.txHash because the initial tx hash from the initial squid
 * transaction is not the same as the final tx hash on the destination chain
 */
const waitForDepositEvent = async (config: SquidDepositConfig) => {
  const apolloClient = getApolloClient();

  return new Promise((resolve) => {
    const sub = apolloClient
      .subscribe<
        DepositBusEventSubscription,
        DepositBusEventSubscriptionVariables
      >({
        query: DepositBusEventDocument,
        variables: {
          partyId: config.toPubKey,
        },
      })
      .subscribe(({ data }) => {
        if (!data?.busEvents?.length) return;

        const event = data.busEvents.find((e) => {
          if (
            e.event.__typename === 'Deposit' &&
            e.event.party.id === config.toPubKey &&
            e.event.asset.id === config.asset.id
          ) {
            return true;
          }
          return false;
        });

        if (
          event &&
          event.event.__typename === 'Deposit' &&
          event.event.status === DepositStatus.STATUS_FINALIZED
        ) {
          sub.unsubscribe();
          resolve(true);
        }
      });
  });
};
