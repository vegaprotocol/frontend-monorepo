const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key] as string;
  }
  return (process.env[key] as string) || '';
};

export const ENV = {
  dsn: windowOrDefault('NX_SENTRY_DSN'),
  flags: {},
  dataSources: {},
};
