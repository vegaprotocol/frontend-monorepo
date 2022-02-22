// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

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

module.exports = withNx(nextConfig);
