module.exports = {
  client: {
    service: {
      name: 'vega',
      url: 'https://api.n09.testnet.vega.xyz/graphql',
    },
    includes: ['../../{apps,libs}/**/*.{ts,tsx,js,jsx,graphql}'],
    excludes: ['**/generic-data-provider.ts'],
  },
};
