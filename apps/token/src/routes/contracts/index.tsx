import { t, useEnvironment } from '@vegaprotocol/react-helpers';
import { Link, Splash } from '@vegaprotocol/ui-toolkit';
import type { EthereumConfig } from '@vegaprotocol/web3';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';

const Contracts = () => {
  const { config } = useEthereumConfig();
  const { ADDRESSES, ETHERSCAN_URL } = useEnvironment();

  if (!config) {
    return (
      <Splash>
        <SplashLoader />
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
            >
              {config.collateral_bridge_contract.address}
            </Link>
          </div>
        );
      })}
      {Object.entries(ADDRESSES).map(([key, value]) => (
        <div
          key={key}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div>{key}:</div>
          <Link
            title={t('View address on Etherscan')}
            href={`${ETHERSCAN_URL}/address/${value}`}
          >
            {value}
          </Link>
        </div>
      ))}
    </section>
  );
};

export default Contracts;
