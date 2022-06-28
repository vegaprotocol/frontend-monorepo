const { defineConfig } = require('cypress');
const setupNodeEvents = require('./src/plugins/index.js');

module.exports = defineConfig({
  projectId: 'et4snf',

  e2e: {
    setupNodeEvents,
    baseUrl: 'http://localhost:3000',
    fileServerFolder: '.',
    fixturesFolder: false,
    specPattern: '**/*.feature',
    excludeSpecPattern: '**/*.js',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.ts',
    video: true,
    videosFolder: '../../dist/cypress/apps/explorer-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/explorer-e2e/screenshots',
    chromeWebSecurity: false,
  },
  env: {
    environment: 'CUSTOM',
    tsConfig: 'tsconfig.json',
    TAGS: 'not @todo and not @ignore and not @manual',
  },
});
