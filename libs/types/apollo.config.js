module.exports = {
  client: {
    service: {
      name: 'vega',
      url: process.env.NX_VEGA_URL || 'https://api.n04.d.vega.xyz/graphql',
    },
    includes: ['../../{apps,libs}/**/*.{ts,tsx,js,jsx,graphql}'],
    excludes: ['**/generic-data-provider.ts'],
  },
};
