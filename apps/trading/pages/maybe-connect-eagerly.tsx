import { useEagerConnect as useVegaEagerConnect } from '@vegaprotocol/wallet-react';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';
import { connectors } from '../lib/web3-connectors';

export const MaybeConnectEagerly = () => {
  // TODO: check dsn/env removal
  // const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  // const [isTelemetryApproved] = useTelemetryApproval();
  // useEthereumEagerConnect(
  //   isTelemetryApproved ? { dsn: SENTRY_DSN, env: VEGA_ENV } : {}
  // );
  useEthereumEagerConnect({ connectors });
  useVegaEagerConnect();

  return null;
};
