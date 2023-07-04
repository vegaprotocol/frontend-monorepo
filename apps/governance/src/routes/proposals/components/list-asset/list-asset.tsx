import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import * as Schema from '@vegaprotocol/types';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useTranslation } from 'react-i18next';
import {
  useAssetListBundleQuery,
  useProposalAssetQuery,
} from './__generated__/Asset';
import { EthWalletContainer } from '../../../../components/eth-wallet-container';

const useListAsset = (assetId: string) => {
  const bridgeContract = useBridgeContract();

  const transaction = useEthereumTransaction<CollateralBridge, 'list_asset'>(
    bridgeContract,
    'list_asset'
  );
  const {
    data,
    loading: loadingAsset,
    error: errorAsset,
  } = useProposalAssetQuery({
    variables: {
      assetId,
    },
  });

  const {
    data: assetData,
    loading: loadingBundle,
    error: errorBundle,
  } = useAssetListBundleQuery({
    variables: {
      assetId,
    },
    skip: !data,
  });
  return {
    transaction,
    data,
    loadingAsset,
    errorAsset,
    assetData,
    loadingBundle,
    errorBundle,
  };
};

export interface ListAssetProps {
  lifetimeLimit: string;
  withdrawalThreshold: string;
  assetId: string;
}

export const ListAsset = ({
  assetId,
  lifetimeLimit,
  withdrawalThreshold,
}: ListAssetProps) => {
  const { t } = useTranslation();
  const {
    transaction,
    data,
    loadingAsset,
    errorAsset,
    assetData,
    loadingBundle,
    errorBundle,
  } = useListAsset(assetId);
  const { perform, Dialog } = transaction;

  if (
    !assetData?.erc20ListAssetBundle ||
    !assetData.erc20ListAssetBundle ||
    !data?.asset ||
    loadingAsset ||
    loadingBundle
  ) {
    return null;
  }
  if (data.asset.source.__typename !== 'ERC20') return null;
  if (data.asset.status !== Schema.AssetStatus.STATUS_PENDING_LISTING) {
    return null;
  }
  if (errorAsset || errorBundle) return null;
  const { assetSource, signatures, vegaAssetId, nonce } =
    assetData.erc20ListAssetBundle;
  return (
    <div className="mb-8">
      <h3 className="text-xl mb-2">{t('ListAsset')}</h3>
      <p className="pr-8">{t('ListAssetDescription')}</p>
      <EthWalletContainer>
        <Button
          data-testid="list-asset"
          onClick={() =>
            perform(
              assetSource,
              `0x${vegaAssetId}`,
              lifetimeLimit,
              withdrawalThreshold,
              nonce,
              signatures
            )
          }
        >
          {t('ListAssetAction')}
        </Button>
      </EthWalletContainer>
      <Dialog />
    </div>
  );
};
