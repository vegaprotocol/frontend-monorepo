import type { TxData } from '@vegaprotocol/smart-contracts-sdk';
import {
  VegaClaim,
  VegaErc20Bridge,
  VegaStaking,
  ERC20Token,
  VegaVesting,
} from '@vegaprotocol/smart-contracts-sdk';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import uniqBy from 'lodash/uniqBy';
import React from 'react';

import { SplashLoader } from '../../components/splash-loader';
import { ADDRESSES, APP_ENV } from '../../config';
import type { ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { defaultProvider } from '../../lib/web3-connectors';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider: activeProvider, account } = useWeb3React();
  const [txs, setTxs] = React.useState<TxData[]>([]);
  const [contracts, setContracts] = React.useState<Pick<
    ContractsContextShape,
    'token' | 'staking' | 'vesting' | 'claim' | 'erc20Bridge'
  > | null>(null);

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  React.useEffect(() => {
    let signer = null;

    const provider = activeProvider ? activeProvider : defaultProvider;

    if (
      account &&
      activeProvider &&
      typeof activeProvider.getSigner === 'function'
    ) {
      signer = provider.getSigner();
    }

    if (provider) {
      setContracts({
        token: new ERC20Token(
          ADDRESSES.vegaTokenAddress,
          // @ts-ignore Cant accept Infura provider
          provider,
          signer
        ),
        // @ts-ignore Cant accept Infura provider
        staking: new VegaStaking(APP_ENV, provider, signer),
        // @ts-ignore Cant accept Infura provider
        vesting: new VegaVesting(APP_ENV, provider, signer),
        // @ts-ignore Cant accept Infura provider
        claim: new VegaClaim(APP_ENV, provider, signer),
        erc20Bridge: new VegaErc20Bridge(
          APP_ENV,
          // @ts-ignore Cant accept Infura provider
          provider,
          signer
        ),
      });
    }
  }, [activeProvider, account]);

  React.useEffect(() => {
    if (!contracts) return;

    const mergeTxs = (existing: TxData[], incoming: TxData[]) => {
      return uniqBy([...incoming, ...existing], 'tx.hash');
    };

    contracts.staking.listen((txs) => {
      setTxs((curr) => mergeTxs(curr, txs));
    });

    contracts.vesting.listen((txs) => {
      setTxs((curr) => mergeTxs(curr, txs));
    });
  }, [contracts]);

  React.useEffect(() => {
    setTxs([]);
  }, [account]);

  if (!contracts) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <ContractsContext.Provider value={{ ...contracts, transactions: txs }}>
      {children}
    </ContractsContext.Provider>
  );
};
