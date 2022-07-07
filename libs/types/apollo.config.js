module.exports = {
  client: {
    service: {
      name: 'vega',
      url: process.env.NX_VEGA_URL,
    },
    includes: ['../../{apps,libs}/**/*.{ts,tsx,js,jsx,graphql}'],
    excludes: ['**/generic-data-provider.ts'],
  },
};
