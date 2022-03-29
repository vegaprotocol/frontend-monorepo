import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import { DepositPage } from '@vegaprotocol/graphql';
import { DepositManager } from './deposit-manager';

const DEPOSIT_PAGE_QUERY = gql`
  query DepositPage {
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
    <PageQueryContainer<DepositPage> query={DEPOSIT_PAGE_QUERY}>
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
