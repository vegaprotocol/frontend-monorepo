import {
  Token,
  TokenVesting,
  Claim,
  StakingBridge,
} from '@vegaprotocol/smart-contracts';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';

import { SplashLoader } from '../../components/splash-loader';
import { type ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';
import { ENV } from '../../config';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider, account, chainId } = useWeb3React();
  const { config } = useEthereumConfig();
  const { VEGA_ENV, ETHEREUM_PROVIDER_URL } = useEnvironment();
  const [contracts, setContracts] = useState<ContractsContextShape | null>(
    null
  );

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let signer = null;

      if (config) {
        if (account && provider && typeof provider.getSigner === 'function') {
          signer = provider.getSigner(account);
        }

        const tokenVestingAddress =
          config.token_vesting_contract?.address ||
          ENV.addresses.tokenVestingAddress;
        if (!tokenVestingAddress) {
          throw new Error('No token vesting address found');
        }

        if (provider && config) {
          const staking = new StakingBridge(
            config.staking_bridge_contract.address,
            signer || provider
          );
          const vegaAddress = await staking.staking_token();
          if (!cancelled) {
            setContracts({
              token: new Token(vegaAddress, signer || provider),
              staking: new StakingBridge(
                config.staking_bridge_contract.address,
                signer || provider
              ),
              vesting: new TokenVesting(
                tokenVestingAddress,
                signer || provider
              ),
              claim: new Claim(ENV.addresses.claimAddress, signer || provider),
            });
          }
        }
      }
    };
    run();
    return () => {
      //  TODO: hacky quick fix for release to prevent race condition, find a better fix for this.
      cancelled = true;
    };
  }, [provider, chainId, account, config, VEGA_ENV, ETHEREUM_PROVIDER_URL]);

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
ContractsProvider.displayName = 'ContractsProvider';
