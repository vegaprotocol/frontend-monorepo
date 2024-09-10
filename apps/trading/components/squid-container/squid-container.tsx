import { SquidStakingWidget } from '@0xsquid/staking-widget';
import type { AppConfig } from '@0xsquid/staking-widget/widget/core/types/config';
import { useT } from '../../lib/use-t';
import { Intent, Loader, Notification } from '@vegaprotocol/ui-toolkit';
import {
  SquidRouterConfigError,
  useSquidRouterConfig,
} from '../../lib/hooks/use-squid-router-config';
import { useDialogStore } from '@vegaprotocol/wallet-react';
import { DepositDisabledMessage } from '../deposit-container/deposit-container';

export const SquidContainer = () => {
  const t = useT();
  const { config, loading, error } = useSquidRouterConfig();
  const open = useDialogStore((store) => store.open);

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
    let intent = Intent.Info;
    if (
      error === SquidRouterConfigError.INTERNAL ||
      error === SquidRouterConfigError.NO_SQUID_API_CONFIGURATION
    ) {
      intent = Intent.Danger;
    }
    return (
      <Notification
        message={error ? errorReason[error] : t('Unable to load widget')}
        intent={intent}
        buttonProps={{
          text: t('Connect wallet'),
          action: open,
        }}
      />
    );
  }

  return <DepositDisabledMessage />;
  // return <SquidWidget config={config} />;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SquidWidget = ({ config }: { config: AppConfig }) => {
  return <SquidStakingWidget config={config} />;
};
