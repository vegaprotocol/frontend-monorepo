import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import { useContracts } from '../../config/contracts/contracts-context';
import type { EthereumConfig } from '@vegaprotocol/web3';

interface ContractDetailsProps {
  config: EthereumConfig | null;
}

export const ContractDetails = ({ config }: ContractDetailsProps) => {
  const { multisig } = useContracts();
  const [validSignerCount, setValidSignerCount] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        const res = await multisig.getValidSignerCount();
        setValidSignerCount(res);
      } catch (err) {
        Sentry.captureException(err);
      }
    })();
  }, [multisig]);

  return (
    <div className="mb-8">
      <p>
        Multisig contract address:{' '}
        <Lozenge>{config?.multisig_control_contract?.address}</Lozenge>
      </p>
      <p>Valid signer count: {validSignerCount}</p>
    </div>
  );
};
