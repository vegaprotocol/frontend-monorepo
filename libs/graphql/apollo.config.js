module.exports = {
  client: {
    service: {
      name: 'vega',
      url: process.env.NX_VEGA_URL || 'https://lb.testnet.vega.xyz/query',
    },
    includes: ['../../{apps,lib}/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
