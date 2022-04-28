import type { EthereumConfig } from '../../../components/web3-container/web3-container';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import type { DepositPage } from './__generated__/DepositPage';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { ASSET_FRAGMENT } from '../../../lib/query-fragments';
import { isERC20Asset } from '../../../lib/assets';

const DEPOSIT_PAGE_QUERY = gql`
  ${ASSET_FRAGMENT}
  query DepositPage {
    assets {
      ...AssetFields
    }
  }
`;

interface DepositContainerProps {
  ethereumConfig: EthereumConfig;
  assetId?: string;
}

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({
  ethereumConfig,
  assetId,
}: DepositContainerProps) => {
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
            bridgeAddress={ethereumConfig.collateral_bridge_contract.address}
            requiredConfirmations={ethereumConfig.confirmations}
            assets={data.assets.filter(isERC20Asset)}
            initialAssetId={assetId}
          />
        );
      }}
    />
  );
};
