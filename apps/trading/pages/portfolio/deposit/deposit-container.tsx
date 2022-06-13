import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import type { DepositPage } from './__generated__/DepositPage';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/network-switcher';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { ASSET_FRAGMENT } from '../../../lib/query-fragments';

const DEPOSIT_PAGE_QUERY = gql`
  ${ASSET_FRAGMENT}
  query DepositPage {
    assets {
      ...AssetFields
    }
  }
`;

interface DepositContainerProps {
  assetId?: string;
}

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({ assetId }: DepositContainerProps) => {
  const { VEGA_ENV } = useEnvironment();

  return (
    <PageQueryContainer<DepositPage>
      query={DEPOSIT_PAGE_QUERY}
      render={(data) => {
        if (!data.assets?.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        return (
          <DepositManager
            assets={data.assets}
            initialAssetId={assetId}
            isFaucetable={VEGA_ENV !== 'MAINNET'}
          />
        );
      }}
    />
  );
};
