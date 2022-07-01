module.exports = {
  client: {
    service: {
      name: 'vega',
      url: 'https://n03.stagnet2.vega.xyz/query',
    },
    includes: ['../../{apps,libs}/**/*.{ts,tsx,js,jsx,graphql}'],
    excludes: ['**/generic-data-provider.ts'],
  },
};
