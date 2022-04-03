import type { EthereumConfig } from '../../../components/web3-container/web3-container';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton, Splash } from '@vegaprotocol/ui-toolkit';
import type { WithdrawPage } from './__generated__/WithdrawPage';

const WITHDRAW_PAGE_QUERY = gql`
  query WithdrawPage {
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

interface WithdrawsContainerProps {
  ethereumConfig: EthereumConfig;
}

/**
 *  Fetches data required for the Deposit page
 */
export const WithdrawsContainer = ({
  ethereumConfig,
}: WithdrawsContainerProps) => {
  return (
    <PageQueryContainer<WithdrawPage> query={WITHDRAW_PAGE_QUERY}>
      {(data) => {
        if (!data.assets?.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        return (
          <div>
            <AnchorButton href="/portfolio/withdraw/create">
              Create
            </AnchorButton>
          </div>
        );
      }}
    </PageQueryContainer>
  );
};
