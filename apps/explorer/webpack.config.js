const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  const additionalPlugins = process.env.SENTRY_AUTH_TOKEN
    ? [
        new SentryPlugin({
          include: './dist/apps/explorer',
          project: 'block-explorer',
        }),
      ]
    : [];

  return {
    ...config,
    plugins: [...additionalPlugins, ...config.plugins],
    ignoreWarnings: [/Failed to parse source map/],
  };
});
