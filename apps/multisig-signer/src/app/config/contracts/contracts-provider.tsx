import { useEffect, useState } from 'react';
import { MultisigControl } from '@vegaprotocol/smart-contracts';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { type ContractsContextShape } from './contracts-context';
import { ContractsContext } from './contracts-context';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';
import { useWeb3React } from '@web3-react/core';

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { provider: activeProvider, account } = useWeb3React();
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
      if (config) {
        if (
          account &&
          activeProvider &&
          typeof activeProvider.getSigner === 'function'
        ) {
          const signer = activeProvider.getSigner();
          if (activeProvider && config) {
            if (!cancelled) {
              setContracts({
                multisig: new MultisigControl(
                  config.multisig_control_contract.address,
                  signer
                ),
              });
            }
          }
        }
      }
    };
    run();
    return () => {
      //  TODO: hacky quick fix for release to prevent race condition, find a better fix for this.
      cancelled = true;
    };
  }, [config, VEGA_ENV, ETHEREUM_PROVIDER_URL, account, activeProvider]);

  if (!contracts) {
    return <Splash>Error: cannot get data on multisig contract</Splash>;
  }

  return (
    <ContractsContext.Provider value={contracts}>
      {children}
    </ContractsContext.Provider>
  );
};
