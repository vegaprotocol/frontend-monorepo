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
});
