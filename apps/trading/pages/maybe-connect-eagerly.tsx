import { useEnvironment } from '@vegaprotocol/environment';
import { useEagerConnect as useVegaEagerConnect } from '@vegaprotocol/wallet';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';
import { useTelemetryApproval } from '../lib/hooks/use-telemetry-approval';

export const MaybeConnectEagerly = () => {
  const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  const [isTelemetryApproved] = useTelemetryApproval();
  useEthereumEagerConnect(
    isTelemetryApproved ? { dsn: SENTRY_DSN, env: VEGA_ENV } : {}
  );
  useVegaEagerConnect();

  return null;
};
