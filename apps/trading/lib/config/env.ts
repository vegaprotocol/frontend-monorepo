const windowOrDefault = (key: string, defaultValue?: string) => {
  if (typeof window !== 'undefined') {
    if (window._env_ && window._env_[key]) {
      return window._env_[key];
    }
  }
  return defaultValue || '';
};

/**
 * Need to have default value as next in-lines environment variables. Cannot figure out dynamic keys.
 * So must provide the default with the key so that next can figure it out.
 */
export const ENV = {
  dsn: windowOrDefault(
    'NX_TRADING_SENTRY_DSN',
    process.env['NX_TRADING_SENTRY_DSN']
  ),
  envName: windowOrDefault('NX_VEGA_ENV', process.env['NX_VEGA_ENV']),
  vegaUrl: windowOrDefault('NX_VEGA_URL', process.env['NX_VEGA_URL']),
};
