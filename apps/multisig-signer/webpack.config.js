const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = (config, context) => {
  const additionalPlugins = process.env.SENTRY_AUTH_TOKEN
    ? [
        new SentryPlugin({
          include: './dist/apps/multisig-signer',
          project: 'multisig-signer',
        }),
      ]
    : [];

  return {
    ...config,
    plugins: [...additionalPlugins, ...config.plugins],
  };
};
