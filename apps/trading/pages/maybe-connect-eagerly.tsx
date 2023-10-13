import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';
import {
  useEagerConnect as useVegaEagerConnect,
  useVegaWallet,
} from '@vegaprotocol/wallet';
import { useGlobalStore } from '../stores';
import { Connectors } from '../lib/vega-connectors';
import { useTelemetryApproval } from '../lib/hooks/use-telemetry-approval';

export const MaybeConnectEagerly = () => {
  const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  const update = useGlobalStore((store) => store.update);
  const eagerConnecting = useVegaEagerConnect(Connectors);
  const [isTelemetryApproved] = useTelemetryApproval();
  useEthereumEagerConnect(
    isTelemetryApproved ? { dsn: SENTRY_DSN, env: VEGA_ENV } : {}
  );

  const { pubKey, connect } = useVegaWallet();
  const [searchParams] = useSearchParams();
  const [query] = useState(searchParams.get('address'));
  if (query && !pubKey) {
    connect(Connectors['view']);
  }
  useEffect(() => {
    update({ eagerConnecting });
  }, [update, eagerConnecting]);
  return null;
};
