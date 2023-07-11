const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const SentryPlugin = require('@sentry/webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  const additionalPlugins = process.env.SENTRY_AUTH_TOKEN
    ? [
        new SentryPlugin({
          include: './dist/apps/token',
          project: 'tokenvegaxyz',
        }),
      ]
    : [];
  return {
    ...config,
    plugins: [...additionalPlugins, ...config.plugins],
    ignoreWarnings: [/Failed to parse source map/],
  };
});
