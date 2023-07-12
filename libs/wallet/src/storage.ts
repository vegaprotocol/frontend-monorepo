import { LocalStorage } from '@vegaprotocol/utils';

interface ConnectorConfig {
  token: string | null;
  connector: 'injected' | 'rest' | 'jsonRpc' | 'view';
  url: string | null;
}

export const WALLET_CONFIG = 'vega_wallet_config';
export const WALLET_KEY = 'vega_wallet_key';
export const WALLET_RISK_ACCEPTED_KEY = 'vega_wallet_risk_accepted';

export function setConfig(cfg: ConnectorConfig) {
  LocalStorage.setItem(WALLET_CONFIG, JSON.stringify(cfg));
}

export function getConfig(): ConnectorConfig | null {
  const cfg = LocalStorage.getItem(WALLET_CONFIG);
  if (cfg) {
    try {
      return JSON.parse(cfg);
    } catch {
      return null;
    }
  } else {
    return null;
  }
}

export function clearConfig() {
  LocalStorage.removeItem(WALLET_CONFIG);
}

export function getAcknowledged() {
  return LocalStorage.getItem(WALLET_RISK_ACCEPTED_KEY) === 'true';
}

export function setAcknowledged() {
  return LocalStorage.setItem(WALLET_RISK_ACCEPTED_KEY, 'true');
}
