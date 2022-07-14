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
    supportFile: './src/support/index.ts',
    video: true,
    videoUploadOnPasses: false,
    videosFolder: '../../dist/cypress/apps/explorer-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/explorer-e2e/screenshots',
    chromeWebSecurity: false,
  },
});
