import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';

import { OnboardDepositForm } from './onboard-deposit-form';
import { type AssetERC20, useEnabledAssets } from '@vegaprotocol/assets';
import { useSquid } from './use-squid';
import { useT } from '../../lib/use-t';
import { type TxDeposit, type TxSquidDeposit } from '../../stores/evm';

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
  const { data: assets, loading } = useEnabledAssets();
  const { data: squid, error: squidError } = useSquid();

  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  // Make sure asset is an existing enabled asset
  const asset = assets?.find((a) => a.id === props.initialAssetId);

  if (!squid) {
    return <p>No squid</p>;
  }

  if (squidError) {
    return <p>Squid error {squidError.message}</p>;
  }

  if (loading) {
    return (
      <p className="text-sm text-surface-1-fg-muted pt-2">{t('Loading...')}</p>
    );
  }

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
};
