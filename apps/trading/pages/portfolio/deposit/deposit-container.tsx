import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import BigNumber from 'bignumber.js';
import { Deposit } from '@vegaprotocol/graphql';
import { DepositManager } from './deposit-manager';

BigNumber.config({ EXPONENTIAL_AT: 20000 });

const DEPOSIT_QUERY = gql`
  query Deposit {
    assets {
      id
      symbol
      name
      decimals
      source {
        ... on ERC20 {
          contractAddress
        }
      }
    }
  }
`;

interface DepositContainerProps {
  ethereumConfig: EthereumConfig;
  assetId?: string;
}

export const DepositContainer = ({
  ethereumConfig,
  assetId,
}: DepositContainerProps) => {
  return (
    <PageQueryContainer<Deposit> query={DEPOSIT_QUERY}>
      {(data) => (
        <DepositManager
          ethereumConfig={ethereumConfig}
          data={data}
          initialAssetId={assetId}
        />
      )}
    </PageQueryContainer>
  );
};
