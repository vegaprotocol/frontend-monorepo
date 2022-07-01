const { defineConfig } = require('cypress');
module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    baseUrl: 'http://localhost:4210',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.ts',
    video: true,
    videosFolder: '../../dist/cypress/apps/explorer-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/explorer-e2e/screenshots',
    chromeWebSecurity: false,
  },
  env: {
    eth_provider_url: 'http://localhost:8545/',
    eth_wallet_public_key: '0xEe7D375bcB50C26d52E1A4a472D8822A2A22d94F',
    eth_staking_bridge_contract_address: '0x9135f5afd6F055e731bca2348429482eE614CFfA',
    vega_wallet_name : 'capsule_wallet',
    vega_wallet_location : '~/.vegacapsule/testnet/wallet',
    vega_wallet_passphrase : '123',
    vega_wallet_mnemonic: 'ozone access unlock valid olympic save include omit supply green clown session',
    vega_wallet_public_key:'02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
    vega_wallet_public_key_short:'02ecea…2f65',
    vega_token_contract_address:'0xF41bD86d462D36b997C0bbb4D97a0a3382f205B7',
    vega_token_address:'0x67175Da1D5e966e40D11c4B2519392B2058373de'
  }

});
