const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
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
    viewportWidth: 1440,
    viewportHeight: 900,
    responseTimeout: 50000,
    requestTimeout: 20000,
  },
  env: {
    VEGA_PUBLIC_KEY:
      '47836c253520d2661bf5bed6339c0de08fd02cf5d4db0efee3b4373f20c7d278',
    VEGA_PUBLIC_KEY2:
      '1a18cdcaaa4f44a57b35a4e9b77e0701c17a476f2b407620f8c17371740cf2e4',
    TRUNCATED_VEGA_PUBLIC_KEY: '47836c…c7d278',
    TRUNCATED_VEGA_PUBLIC_KEY2: '1a18cd…0cf2e4',
    ETHEREUM_PROVIDER_URL:
      'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    ETHEREUM_WALLET_ADDRESS: '0x265Cc6d39a1B53d0d92068443009eE7410807158',
    ETHERSCAN_URL: 'https://sepolia.etherscan.io',
    ETHEREUM_CHAIN_ID: 11155111,
    ETH_WALLET_MNEMONIC:
      'ugly gallery notice network true range brave clarify flat logic someone chunk',
    TRADING_MODE_LINK:
      'https://docs.vega.xyz/testnet/concepts/trading-on-vega/trading-modes#auction-type-liquidity-monitoring',
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
    txTimeout: { timeout: 70000 },
  },
});
