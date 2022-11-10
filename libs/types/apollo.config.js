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
      '**/__generated__/*',
      '../../libs/accounts/**',
      '../../libs/assets/**',
      '../../libs/candles-chart/**',
      '../../libs/cypress/**',
      '../../libs/deal-ticket/**',
      '../../libs/deposits/**',
      '../../libs/environment/**',
      '../../libs/fills/**',
      '../../libs/governance/**',
      '../../libs/ledger/**',
      '../../libs/liquidity/**',
      // @TODO: uncomment these when migrated
      // '../../libs/maket-depth/**',
      // '../../libs/market-list/**',
      // '../../libs/market-info/**',
      '../../libs/network-info/**',
      '../../libs/network-stats/**',
      '../../libs/orders/**',
      '../../libs/positions/**',
      '../../libs/react-helpers/**',
      '../../libs/smart-contracts/**',
      '../../libs/tailwind-config/**',
      '../../libs/trades/**',
      '../../libs/ui-toolkit/**',
      '../../libs/wallet/**',
      '../../libs/web3/**',
      '../../libs/withdraws/**',
    ],
  },
};
