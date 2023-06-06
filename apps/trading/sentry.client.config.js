import { ENV } from './lib/config/env';
import { LocalStorage, SentryInit } from '@vegaprotocol/logger';
import { STORAGE_KEY } from './lib/hooks/use-telemetry-approval';

const { dsn, envName } = ENV;
const isTelemetryApproved = !!LocalStorage.getItem(STORAGE_KEY);
if (dsn && isTelemetryApproved) {
  SentryInit(dsn, envName);
}
