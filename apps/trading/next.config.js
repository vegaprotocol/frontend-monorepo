// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nx/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs');

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

const sentryWebpackOptions = {
  org: 'vega-o3',
  project: 'trading',
  token: SENTRY_AUTH_TOKEN,
};

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
};

module.exports = SENTRY_AUTH_TOKEN
  ? withNx(withSentryConfig(nextConfig, sentryWebpackOptions))
  : withNx(nextConfig);
