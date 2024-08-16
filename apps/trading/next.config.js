const childProcess = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nx/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs');

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

const sentryWebpackOptions = {
  org: 'vega-o3',
  project: 'trading',
  token: SENTRY_AUTH_TOKEN,
};

const commitHash = childProcess
  .execSync('git rev-parse HEAD')
  .toString()
  .trim();

// Get the tag of the last commit
const commitLog = childProcess
  .execSync('git log --decorate --oneline -1')
  .toString()
  .trim();

const tagMatch = commitLog.match(/tag: ([^,)]+)/);
const tag = tagMatch ? tagMatch[1] : '';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  pageExtensions: ['page.tsx', 'page.jsx'],
  env: {
    GIT_COMMIT: commitHash,
    GIT_TAG: tag,
  },
};

module.exports = SENTRY_AUTH_TOKEN
  ? withNx(withSentryConfig(nextConfig, sentryWebpackOptions))
  : withNx(nextConfig);
