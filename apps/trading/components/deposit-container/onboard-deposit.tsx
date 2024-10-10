import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';

import { OnboardDepositForm } from './onboard-deposit-form';
import { type AssetERC20, useEnabledAssets } from '@vegaprotocol/assets';
import { useSquid } from './use-squid';
import { useT } from '../../lib/use-t';
import { type TxDeposit, type TxSquidDeposit } from '../../stores/evm';
import { OnboardFallbackDepositForm } from './onboard-fallback-deposit-form';

/**
 * Gets env vars, assets, and configs required for the deposit form
 */
export const OnboardDeposit = (props: {
  initialAssetId?: string;
  onDeposit?: (tx: TxDeposit | TxSquidDeposit) => void;
  minAmount?: string;
}) => {
  const t = useT();
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets, loading: assetsLoading } = useEnabledAssets();
  const { data: squid, isPending: squidPending } = useSquid();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  // Make sure asset is an existing enabled asset
  const asset = assets?.find((a) => a.id === props.initialAssetId);

  if (assetsLoading || squidPending) {
    return (
      <p className="text-sm text-surface-1-fg-muted pt-2">{t('Loading...')}</p>
    );
  }

  if (squid && squid.initialized) {
    return (
      <OnboardDepositForm
        squid={squid}
        assets={assets as AssetERC20[]}
        initialAsset={asset as AssetERC20}
        configs={allConfigs}
        onDeposit={props.onDeposit}
        minAmount={props.minAmount}
      />
    );
  }

  return (
    <OnboardFallbackDepositForm
      assets={assets as AssetERC20[]}
      initialAsset={asset as AssetERC20}
      configs={allConfigs}
      onDeposit={props.onDeposit}
      minAmount={props.minAmount}
    />
  );
};
