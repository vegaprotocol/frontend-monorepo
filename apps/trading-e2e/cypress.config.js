const { defineConfig } = require('cypress');

module.exports = defineConfig({
  component: {
    baseUrl: 'http://localhost:4200',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
    video: true,
    videosFolder: '../../dist/cypress/apps/trading-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/trading-e2e/screenshots',
    chromeWebSecurity: false,
    projectId: 'et4snf',
    defaultCommandTimeout: 10000,
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
    video: true,
    videosFolder: '../../dist/cypress/apps/trading-e2e/videos',
    videoUploadOnPasses: false,
    screenshotsFolder: '../../dist/cypress/apps/trading-e2e/screenshots',
    chromeWebSecurity: false,
    projectId: 'et4snf',
    defaultCommandTimeout: 10000,
    viewportWidth: 1440,
    viewportHeight: 900,
  },
  env: {
    TRADING_TEST_VEGA_WALLET_NAME: 'UI_Trading_Test',
    ETHEREUM_PROVIDER_URL:
      'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    VEGA_PUBLIC_KEY:
      '47836c253520d2661bf5bed6339c0de08fd02cf5d4db0efee3b4373f20c7d278',
    VEGA_PUBLIC_KEY2:
      '1a18cdcaaa4f44a57b35a4e9b77e0701c17a476f2b407620f8c17371740cf2e4',
    TRUNCATED_VEGA_PUBLIC_KEY: '47836c…c7d278',
    TRUNCATED_VEGA_PUBLIC_KEY2: '1a18cd…0cf2e4',
    ETHEREUM_WALLET_ADDRESS: '0x265Cc6d39a1B53d0d92068443009eE7410807158',
    ETHERSCAN_URL: 'https://ropsten.etherscan.io',
    tsConfig: 'tsconfig.json',
    TAGS: 'not @todo and not @ignore and not @manual',
    TRADING_TEST_VEGA_WALLET_PASSPHRASE: 'UI_Trading_Test',
    ETH_WALLET_MNEMONIC:
      'ugly gallery notice network true range brave clarify flat logic someone chunk',
  },
});
