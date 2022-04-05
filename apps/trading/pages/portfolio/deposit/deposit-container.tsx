import type { EthereumConfig } from '../../../components/web3-container/web3-container';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import type {
  DepositPage,
  DepositPage_assets,
} from './__generated__/DepositPage';
import type { Asset } from '@vegaprotocol/deposits';
import { DepositManager } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';

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

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = ({
  ethereumConfig,
  assetId,
}: DepositContainerProps) => {
  return (
    <PageQueryContainer<DepositPage> query={DEPOSIT_PAGE_QUERY}>
      {(data) => {
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
    </PageQueryContainer>
  );
};

const isERC20Asset = (asset: DepositPage_assets): asset is Asset => {
  if (asset.source.__typename === 'ERC20') {
    return true;
  }
  return false;
};
