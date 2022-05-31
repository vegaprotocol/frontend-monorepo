import { t, useEnvironment } from '@vegaprotocol/react-helpers';
import { Link, Splash } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';

const Contracts = () => {
  const { config } = useEthereumConfig();
  const { ETHERSCAN_URL } = useEnvironment();

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
      {/* TODO: Show token contract and claim contract here */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{'collateral_bridge_contract'}:</div>
        <Link
          title={t('View address on Etherscan')}
          href={`${ETHERSCAN_URL}/address/${config.collateral_bridge_contract.address}`}
        >
          {config.collateral_bridge_contract.address}
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{'multisig_control_contract'}:</div>
        <Link
          title={t('View address on Etherscan')}
          href={`${ETHERSCAN_URL}/address/${config.multisig_control_contract.address}`}
        >
          {config.multisig_control_contract.address}
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{'staking_bridge_contract'}:</div>
        <Link
          title={t('View address on Etherscan')}
          href={`${ETHERSCAN_URL}/address/${config.staking_bridge_contract.address}`}
        >
          {config.staking_bridge_contract.address}
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{'token_vesting_contract'}:</div>
        <Link
          title={t('View address on Etherscan')}
          href={`${ETHERSCAN_URL}/address/${config.token_vesting_contract.address}`}
        >
          {config.token_vesting_contract.address}
        </Link>
      </div>
    </section>
  );
};

export default Contracts;
