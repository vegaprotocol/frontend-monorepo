import { SquidStakingWidget } from '@0xsquid/staking-widget';
import type { AppConfig } from '@0xsquid/staking-widget/widget/core/types/config';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { useT } from '../../lib/use-t';
import { Loader } from '@vegaprotocol/ui-toolkit';
import {
  SquidRouterConfigError,
  useSquidRouterConfig,
} from '../../lib/hooks/use-squid-router-config';

export const SquidContainer = () => {
  const t = useT();
  const { config, loading, error } = useSquidRouterConfig();

  const errorReason: Record<SquidRouterConfigError, string> = {
    [SquidRouterConfigError.NO_SQUID_API_CONFIGURATION]: t(
      'Unable to load the squid router API configuration'
    ),
    [SquidRouterConfigError.NO_VEGA_PUBKEY]: t(
      'Please connect your Vega Wallet before continuing with the cross chain deposit'
    ),
    [SquidRouterConfigError.NO_SUPPORTED_ASSETS]: t('Unable to load assets'),
    [SquidRouterConfigError.INTERNAL]: t('Something went wrong'),
  };

  if (loading) {
    return <Loader size="small" />;
  }

  if (error != null || !config) {
    return (
      <>
        <p className="text-sm mb-1">
          {error ? errorReason[error] : t('Unable to load widget')}
        </p>
        {error === SquidRouterConfigError.NO_VEGA_PUBKEY && (
          <VegaWalletConnectButton />
        )}
      </>
    );
  }

  return <SquidWidget config={config} />;
};

const SquidWidget = ({ config }: { config: AppConfig }) => {
  return <SquidStakingWidget config={config} />;
};
