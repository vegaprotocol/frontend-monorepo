import { t } from '@vegaprotocol/i18n';
import { Link, Splash, Loader } from '@vegaprotocol/ui-toolkit';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../components/heading';
import { ENV } from '../../config/env';
import type { RouteChildProps } from '../index';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Contracts = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { config } = useEthereumConfig();
  const { ETHERSCAN_URL } = useEnvironment();

  if (!config) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  return (
    <section>
      <Heading title={'Contracts'} />
      <hr />
      {[
        'collateral_bridge_contract',
        'multisig_control_contract',
        'staking_bridge_contract',
        'token_vesting_contract',
      ].map((key) => {
        const contract = config[key as keyof EthereumConfig] as {
          address: string;
        };

        return (
          <div
            key={key}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <div>{key}:</div>
            <Link
              title={t('View address on Etherscan')}
              href={`${ETHERSCAN_URL}/address/${contract.address}`}
              target="_blank"
            >
              {contract.address}
            </Link>
          </div>
        );
      })}
      {Object.entries(ENV.addresses).map(([key, value]) => (
        <div
          key={key}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div>{key}:</div>
          <Link
            title={t('View address on Etherscan')}
            href={`${ETHERSCAN_URL}/address/${value}`}
            target="_blank"
          >
            {value}
          </Link>
        </div>
      ))}
    </section>
  );
};

export default Contracts;
