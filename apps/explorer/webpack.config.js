const { execSync } = require('child_process');
const webpack = require('webpack');
const SentryPlugin = require('@sentry/webpack-plugin');

const gitCommitHash = execSync('git rev-parse HEAD').toString();
const gitOriginUrl = execSync('git remote get-url origin')
  .toString()
  .replace('ssh://git@github.com', 'https://github.com')
  .replace('.git', '');

module.exports = (config, context) => {
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
    plugins: [
      ...additionalPlugins,
      ...config.plugins,
      new webpack.DefinePlugin({
        'process.env.GIT_COMMIT_HASH': JSON.stringify(gitCommitHash),
        'process.env.GIT_ORIGIN_URL': JSON.stringify(gitOriginUrl),
      }),
    ],
  };
};
