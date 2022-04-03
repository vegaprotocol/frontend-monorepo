import { gql } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { CreateWithdrawManager } from '@vegaprotocol/withdraws';
import { PageQueryContainer } from '../../../../components/page-query-container';
import type { CreateWithdrawPage } from './__generated__/CreateWithdrawPage';

const CREATE_WITHDRAW_PAGE_QUERY = gql`
  query CreateWithdrawPage {
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

interface CreateWithdrawPageContainerProps {
  assetId?: string;
}

/**
 *  Fetches data required for the Deposit page
 */
export const CreateWithdrawPageContainer = ({
  assetId,
}: CreateWithdrawPageContainerProps) => {
  return (
    <PageQueryContainer<CreateWithdrawPage> query={CREATE_WITHDRAW_PAGE_QUERY}>
      {(data) => {
        if (!data.assets?.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        return (
          <CreateWithdrawManager
            // @ts-ignore TS not inferring on union type for contract address
            assets={data.assets.filter((a) => a.source.__typename === 'ERC20')}
            initialAssetId={assetId}
          />
        );
      }}
    </PageQueryContainer>
  );
};
