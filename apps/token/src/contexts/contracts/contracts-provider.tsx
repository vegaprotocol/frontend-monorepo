import {
  Token,
  TokenVesting,
  Claim,
  CollateralBridge,
  StakingBridge,
} from '@vegaprotocol/smart-contracts';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import React from 'react';

import { SplashLoader } from '../../components/splash-loader';
import type { ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { createDefaultProvider } from '../../lib/web3-connectors';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/react-helpers';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider: activeProvider, account } = useWeb3React();
  const { config } = useEthereumConfig();
  const { VEGA_ENV, ADDRESSES, ETHEREUM_PROVIDER_URL, ETHEREUM_CHAIN_ID } =
    useEnvironment();
  const [contracts, setContracts] = React.useState<Pick<
    ContractsContextShape,
    'token' | 'staking' | 'vesting' | 'claim' | 'erc20Bridge'
  > | null>(null);
  const defaultProvider = createDefaultProvider(
    ETHEREUM_PROVIDER_URL,
    ETHEREUM_CHAIN_ID
  );

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  React.useEffect(() => {
    const run = async () => {
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
        const staking = new StakingBridge(
          config.staking_bridge_contract.address,
          signer || provider
        );
        const vegaAddress = await staking.stakingToken();

        setContracts({
          token: new Token(vegaAddress, signer || provider),
          staking: new StakingBridge(
            config.staking_bridge_contract.address,
            signer || provider
          ),
          vesting: new TokenVesting(
            config.token_vesting_contract.address,
            signer || provider
          ),
          claim: new Claim(ADDRESSES.claimAddress, signer || provider),
          erc20Bridge: new CollateralBridge(
            config.collateral_bridge_contract.address,
            signer || provider
          ),
        });
      }
    };
    run();
  }, [activeProvider, account, config, ADDRESSES, VEGA_ENV]);

  if (!contracts) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <ContractsContext.Provider value={contracts}>
      {children}
    </ContractsContext.Provider>
  );
};
