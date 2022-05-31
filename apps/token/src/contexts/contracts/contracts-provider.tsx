import {
  createCollateralBridgeContract,
  createStakingBridgeContract,
  createTokenContract,
  createTokenVestingContract,
} from '@vegaprotocol/smart-contracts';
import { VegaClaim } from '@vegaprotocol/smart-contracts';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import React from 'react';

import { SplashLoader } from '../../components/splash-loader';
import type { ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { defaultProvider } from '../../lib/web3-connectors';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/react-helpers';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider: activeProvider, account } = useWeb3React();
  const { config } = useEthereumConfig();
  const { VEGA_ENV, ADDRESSES } = useEnvironment();
  // const [txs, setTxs] = React.useState<TxData[]>([]);
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

    if (provider && config) {
      setContracts({
        token: createTokenContract(
          ADDRESSES.vegaTokenAddress,
          signer || provider
        ),
        staking: createStakingBridgeContract(
          config.staking_bridge_contract.address,
          signer || provider
        ),
        vesting: createTokenVestingContract(
          config.token_vesting_contract.address,
          signer || provider
        ),
        // @ts-ignore Cant accept JsonRpcProvider provider
        claim: new VegaClaim(VEGA_ENV, provider, signer),
        erc20Bridge: createCollateralBridgeContract(
          config.collateral_bridge_contract.address,
          signer || provider
        ),
      });
    }
  }, [activeProvider, account, config, ADDRESSES, VEGA_ENV]);

  // React.useEffect(() => {
  //   if (!contracts) return;

  //   const mergeTxs = (existing: TxData[], incoming: TxData[]) => {
  //     return uniqBy([...incoming, ...existing], 'tx.hash');
  //   };

  //   contracts.staking.listen((txs) => {
  //     setTxs((curr) => mergeTxs(curr, txs));
  //   });

  //   contracts.vesting.listen((txs) => {
  //     setTxs((curr) => mergeTxs(curr, txs));
  //   });
  // }, [contracts]);

  // React.useEffect(() => {
  //   setTxs([]);
  // }, [account]);

  if (!contracts) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    // TODO: re add transactions array
    <ContractsContext.Provider value={{ ...contracts, transactions: [] }}>
      {children}
    </ContractsContext.Provider>
  );
};
