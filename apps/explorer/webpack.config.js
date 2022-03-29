const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = (config, context) => {
  const additionalPlugins = process.env.SENTRY_AUTH_TOKEN
    ? [
        new SentryPlugin({
          include: './dist/apps/explorer',
        }),
      ]
    : [];
  return {
    ...config,
    plugins: [...additionalPlugins, ...config.plugins],
  };
};
