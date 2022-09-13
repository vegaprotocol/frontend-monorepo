import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import type { DepositPage } from './__generated__/DepositPage';
import { DepositManager } from '@vegaprotocol/deposits';
import { Schema } from '@vegaprotocol/types';
import { getNodes, t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  AssetFieldsFragmentDoc,
  AssetFieldsFragment,
} from '@vegaprotocol/assets';

const DEPOSIT_PAGE_QUERY = gql`
  ${AssetFieldsFragmentDoc}
  query DepositPage {
    assetsConnection {
      edges {
        node {
          ...AssetFields
        }
      }
    }
  }
`;

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const { VEGA_ENV } = useEnvironment();

  return (
    <PageQueryContainer<DepositPage>
      query={DEPOSIT_PAGE_QUERY}
      render={(data) => {
        const assets = getNodes<AssetFieldsFragment>(
          data,
          (node) => node?.status === Schema.AssetStatus.STATUS_ENABLED
        );
        if (!assets.length) {
          return (
            <Splash>
              <p>{t('No assets on this network')}</p>
            </Splash>
          );
        }

        return (
          <DepositManager
            assets={assets}
            isFaucetable={VEGA_ENV !== 'MAINNET'}
          />
        );
      }}
    />
  );
};
