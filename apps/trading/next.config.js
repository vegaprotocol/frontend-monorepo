// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackOptions = {
  org: 'vega-o3',
  project: 'trading',
  authToken: process.env.SENTRY_AUTH_TOKEN,
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

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

module.exports = sentryAuthToken
  ? withNx(withSentryConfig(nextConfig, sentryWebpackOptions))
  : withNx(nextConfig);
