import { ENV } from './lib/config/env';
import { LocalStorage } from '@vegaprotocol/utils';
import { STORAGE_KEY, SentryInit } from './lib/hooks/use-telemetry-approval';

const { dsn } = ENV;
const isTelemetryApproved = !!LocalStorage.getItem(STORAGE_KEY);

if (dsn && isTelemetryApproved) {
  SentryInit(dsn, ENV.envName);
}
