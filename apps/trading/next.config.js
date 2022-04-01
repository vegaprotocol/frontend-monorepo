// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs');

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

const sentryWebpackOptions = {
  org: 'vega-o3',
  project: 'trading',
  authToken: SENTRY_AUTH_TOKEN,
};

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  pageExtensions: ['page.tsx', 'page.jsx'],
  experimental: {
    // https://github.com/vercel/next.js/issues/32360
    esmExternals: false,
  },
};

module.exports = SENTRY_AUTH_TOKEN
  ? withNx(withSentryConfig(nextConfig, sentryWebpackOptions))
  : withNx(nextConfig);
