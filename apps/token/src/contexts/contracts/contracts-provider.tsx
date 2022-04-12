import type { TxData } from '@vegaprotocol/smart-contracts-sdk';
import {
  VegaClaim,
  VegaErc20Bridge,
  VegaStaking,
  ERC20Token,
  VegaVesting,
} from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import uniqBy from 'lodash/uniqBy';
import React from 'react';

import { SplashLoader } from '../../components/splash-loader';
import { SplashScreen } from '../../components/splash-screen';
import { APP_ENV } from '../../config';
import type { ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider, account } = useWeb3React();
  const [txs, setTxs] = React.useState<TxData[]>([]);
  const [contracts, setContracts] = React.useState<Pick<
    ContractsContextShape,
    'token' | 'staking' | 'vesting' | 'claim' | 'erc20Bridge'
  > | null>(null);

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  React.useEffect(() => {
    // TODO: TFE import allow optional signer using fallback provider if not connected
    // let signer = null;

    // if (account && provider && typeof provider.getSigner === 'function') {
    //   signer = provider.getSigner();
    // }

    if (provider) {
      setContracts({
        token: new ERC20Token(
          '0xDc335304979D378255015c33AbFf09B60c31EBAb',
          provider,
          provider.getSigner()
        ),
        staking: new VegaStaking(APP_ENV, provider, provider.getSigner()),
        vesting: new VegaVesting(APP_ENV, provider, provider.getSigner()),
        claim: new VegaClaim(APP_ENV, provider, provider.getSigner()),
        erc20Bridge: new VegaErc20Bridge(
          APP_ENV,
          provider,
          provider.getSigner()
        ),
      });
    }
  }, [provider, account]);

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
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return (
    <ContractsContext.Provider value={{ ...contracts, transactions: txs }}>
      {children}
    </ContractsContext.Provider>
  );
};
