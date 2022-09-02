module.exports = {
  client: {
    service: {
      name: 'vega',
      url:
        process.env.GRAPHQL_SCHEMA_PATH ||
        'https://api.n07.testnet.vega.xyz/graphql',
    },
    includes: [
      '../../{apps,libs}/**/*.{ts,tsx,js,jsx}',
      '../../apps/token/client.graphql',
      '../../apps/trading/client.graphql',
    ],
    excludes: [
      '**/generic-data-provider.ts',
      '**/__generated___/*',
      '../../libs/assets',
    ],
  },
};
