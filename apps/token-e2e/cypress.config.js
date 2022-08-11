const { defineConfig } = require('cypress');
module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    baseUrl: 'http://localhost:4210',
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    specPattern:
      process.env.CYPRESS_INCLUDE_FLOWS === 'true' ||
      process.env.CYPRESS_INCLUDE_FLOWS === true
        ? [
            './src/integration/view/**/*.cy.{js,jsx,ts,tsx}',
            './src/integration/flow/**/*.cy.{js,jsx,ts,tsx}',
          ]
        : ['./src/integration/view/**/*.cy.{js,jsx,ts,tsx}'],
    modifyObstructiveCode: false,
    supportFile: './src/support/index.ts',
    video: true,
    videoUploadOnPasses: false,
    videosFolder: '../../dist/cypress/apps/token-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/token-e2e/screenshots',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
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
    vegaTokenContractAddress: '0xF41bD86d462D36b997C0bbb4D97a0a3382f205B7',
    vegaTokenAddress: '0x67175Da1D5e966e40D11c4B2519392B2058373de',
    epochTimeout: { timeout: 10000 },
    txTimeout: { timeout: 40000 },
  },
});
