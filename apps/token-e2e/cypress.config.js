const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-grep/src/plugin')(config);
      return config;
    },
    baseUrl: 'http://localhost:4210',
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    specPattern: [
      './src/integration/view/**/*.cy.{js,jsx,ts,tsx}',
      './src/integration/flow/**/*.cy.{js,jsx,ts,tsx}',
    ],
    modifyObstructiveCode: false,
    supportFile: './src/support/index.js',
    video: false,
    videoUploadOnPasses: false,
    videosFolder: '../../dist/cypress/apps/token-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/token-e2e/screenshots',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
    numTestsKeptInMemory: 5,
  },
  env: {
    ethProviderUrl: 'http://localhost:8545/',
    ethWalletPublicKey: '0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F',
    ethWalletPublicKeyTruncated: '0xEe7D…d94F',
    ethStakingBridgeContractAddress:
      '0x9135f5afd6F055e731bca2348429482eE614CFfA',
    vegaWalletName: 'capsule_wallet',
    vegaWalletLocation: '~/.vegacapsule/testnet/wallet',
    vegaWalletPassphrase: '123',
    vegaWalletMnemonic:
      'ozone access unlock valid olympic save include omit supply green clown session',
    vegaWalletPublicKey:
      '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
    vegaWalletPublicKeyShort: '02ecea…2f65',
    vegaWalletPublicKey2:
      '7f9cf07d3a9905b1a61a1069f7a758855da428bc0f4a97de87f48644bfc25535',
    vegaWalletPublicKey2Short: '7f9cf0…5535',
    vegaTokenContractAddress: '0xF41bD86d462D36b997C0bbb4D97a0a3382f205B7',
    vegaTokenAddress: '0x67175Da1D5e966e40D11c4B2519392B2058373de',
    txTimeout: { timeout: 70000 },
    epochTimeout: { timeout: 6000 },
    blockConfirmations: 3,
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
  },
});
