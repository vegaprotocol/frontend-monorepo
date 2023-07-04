const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
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
});
