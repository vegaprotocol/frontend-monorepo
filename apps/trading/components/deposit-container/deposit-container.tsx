import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';

import { useAssetsWithBalance } from '../../lib/hooks/use-assets-with-balance';
import { DepositForm } from './deposit-form';
import { useEnvironment } from '@vegaprotocol/environment';
import { SquidContainer } from './squid-container';

/**
 * Gets env vars, assets, and configs required for the deposit form
 */
export const DepositContainer = ({
  initialAssetId,
}: {
  initialAssetId?: string;
}) => {
  const { SQUID_INTEGRATOR_ID, SQUID_API_URL } = useEnvironment();
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { data: assets, loading } = useAssetsWithBalance();

  if (!SQUID_INTEGRATOR_ID || !SQUID_API_URL) return null;
  if (!config) return null;
  if (!configs?.length) return null;

  const allConfigs = [config, ...configs];

  // Make sure asset is an existing enabled asset
  const asset = assets?.find((a) => a.id === initialAssetId);

  if (loading) {
    return null;
  }

  return (
    <SquidContainer integratorId={SQUID_INTEGRATOR_ID} apiUrl={SQUID_API_URL}>
      {(squid) => (
        <DepositForm
          squid={squid}
          assets={assets}
          initialAssetId={asset?.id || ''}
          configs={allConfigs}
        />
      )}
    </SquidContainer>
  );
};
