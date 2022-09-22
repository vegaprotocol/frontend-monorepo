const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-grep/src/plugin')(config);
      return config;
    },
    baseUrl: 'http://localhost:3000',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.ts',
    video: false,
    videoUploadOnPasses: false,
    videosFolder: '../../dist/cypress/apps/explorer-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/explorer-e2e/screenshots',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
  },
  env: {
    environment: 'CUSTOM',
    networkQueryUrl: 'http://localhost:3028/query',
    ethUrl: 'https://ropsten.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    commitHash: 'dev',
    tsConfig: 'tsconfig.json',
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
  },
});
