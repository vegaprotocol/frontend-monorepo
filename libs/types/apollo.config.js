module.exports = {
  client: {
    service: {
      name: 'vega',
      url: 'http://vega-mainnet-0002-observer.vega.xyz:3008/query',
    },
    includes: [
      '../../{apps,libs}/**/*.{ts,tsx,js,jsx}',
      '../../apps/token/client.graphql',
      '../../apps/trading/client.graphql',
    ],
    excludes: ['**/generic-data-provider.ts', '**/__generated___/*'],
  },
};
