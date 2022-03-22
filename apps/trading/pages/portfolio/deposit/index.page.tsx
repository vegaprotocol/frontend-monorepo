import { gql } from '@apollo/client';
import { NetworkParametersQuery } from '@vegaprotocol/graphql';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { PageQueryContainer } from '../../../components/page-query-container';
import { Web3Container } from '../../../components/web3-container';
import { DepositForm } from './deposit-form';

interface EthereumConfig {
  network_id: string;
  chain_id: string;
  confirmations: number;
  collateral_bridge_contract: {
    address: string;
  };
  multisig_control_contract: {
    address: string;
    deployment_block_height: number;
  };
  staking_bridge_contract: {
    address: string;
    deployment_block_height: number;
  };
  token_vesting_contract: {
    address: string;
    deployment_block_height: number;
  };
}

const NETWORK_PARAMS_QUERY = gql`
  query NetworkParametersQuery {
    networkParameters {
      key
      value
    }
  }
`;

const Deposit = () => {
  return (
    <Web3Container>
      <PageQueryContainer<NetworkParametersQuery> query={NETWORK_PARAMS_QUERY}>
        {(data) => {
          const ethereumConfigParam = data.networkParameters.find(
            (np) => np.key === 'blockchains.ethereumConfig'
          );

          if (!ethereumConfigParam) {
            return (
              <Splash>
                <p>No ethereum config found</p>
              </Splash>
            );
          }

          let config: EthereumConfig;

          try {
            config = JSON.parse(ethereumConfigParam.value);
          } catch {
            return (
              <Splash>
                <p>Could not parse config</p>
              </Splash>
            );
          }

          return (
            <div className="p-24">
              <h1 className="text-h3">Deposit</h1>
              <DepositForm />
            </div>
          );
        }}
      </PageQueryContainer>
    </Web3Container>
  );
};

export default Deposit;
