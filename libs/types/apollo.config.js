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
      '../../libs/accounts/**',
      '../../libs/assets/**',
      '../../libs/candles-chart/**',
      '../../libs/deal-ticket/**',
      '../../libs/deposits/**',
      '../../libs/environment/**',
      '../../libs/fills/**',
      '../../libs/governance/**',
      '../../libs/liquidity/**',
      '../../libs/market-depth/**',
      '../../libs/market-info/**',
      '../../libs/market-list/**',
      '../../libs/network-stats/**',
      '../../libs/orders/**',
      '../../libs/positions/**',
      '../../libs/react-helpers/**',
      '../../libs/trades/**',
      '../../libs/web3/**',
      '../../libs/wallet/**',
      '../../libs/withdraws/**',
    ],
  },
};
