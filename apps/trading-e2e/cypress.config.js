const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: '../../node_modules/cypress-mochawesome-reporter',
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/src/plugin')(config);
      return config;
    },
    baseUrl: 'http://localhost:4200',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.js',
    video: false,
    videosFolder: '../../dist/cypress/apps/trading-e2e/videos',
    videoUploadOnPasses: false,
    screenshotsFolder: '../../dist/cypress/apps/trading-e2e/screenshots',
    chromeWebSecurity: false,
    projectId: 'et4snf',
    defaultCommandTimeout: 10000,
    viewportWidth: 1800,
    viewportHeight: 900,
    responseTimeout: 50000,
    requestTimeout: 20000,
    retries: 0,
    testIsolation: false,
  },
  env: {
    ETHERSCAN_URL: 'https://sepolia.etherscan.io',
    ETHEREUM_CHAIN_ID: 11155111,
    TRADING_MODE_LINK:
      'https://docs.vega.xyz/testnet/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring',
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
    txTimeout: { timeout: 70000 },
  },
});
