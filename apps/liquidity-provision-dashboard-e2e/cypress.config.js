const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    baseUrl: 'http://localhost:4200',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: './src/integration/*.ts',
    excludeSpecPattern: '**/*.js',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.js',
    video: false,
    videoUploadOnPasses: false,
    videosFolder:
      '../../dist/cypress/apps/liquidity-provision-dashboard-e2e/videos',
    screenshotsFolder:
      '../../dist/cypress/apps/liquidity-provision-dashboard-e2e/screenshots',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
  },
  env: {
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
  },
});
