import { MultisigControl } from '@vegaprotocol/smart-contracts';
import { Splash } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { ethers } from 'ethers';
import type { ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { config } = useEthereumConfig();
  const { VEGA_ENV, ETHEREUM_PROVIDER_URL } = useEnvironment();
  const [contracts, setContracts] =
    React.useState<ContractsContextShape | null>(null);

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (config) {
        const provider = new ethers.providers.JsonRpcProvider(
          ETHEREUM_PROVIDER_URL,
          Number(config.chain_id)
        );

        if (provider && config) {
          if (!cancelled) {
            setContracts({
              multisig: new MultisigControl(
                config.multisig_control_contract.address,
                provider
              ),
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
  }, [config, VEGA_ENV, ETHEREUM_PROVIDER_URL]);

  if (!contracts) {
    return <Splash>Error: cannot get data on multisig contract</Splash>;
  }

  return (
    <ContractsContext.Provider value={contracts}>
      {children}
    </ContractsContext.Provider>
  );
};
