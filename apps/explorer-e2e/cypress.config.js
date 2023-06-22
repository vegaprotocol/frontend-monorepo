const { defineConfig } = require('cypress');
const webpack = require('webpack');
const webpackPreprocessor = require('@cypress/webpack-batteries-included-preprocessor');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
  reporter: '../../node_modules/cypress-mochawesome-reporter',

  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/src/plugin')(config);

      const defaultConfig = webpackPreprocessor.defaultOptions;
      defaultConfig.webpackOptions.context = path.resolve(__dirname, './');
      defaultConfig.webpackOptions.module.rules[1].test = /(\.tsx?|\.jsx?)$/;
      defaultConfig.webpackOptions.module.rules[1].exclude = [
        /node_modules\/(?!(@vegaprotocol\/protos|protobuf-codec))/,
        /browserslist/,
      ];
      defaultConfig.webpackOptions.module.rules.push({
        test: /(\.css|\.s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      });
      defaultConfig.webpackOptions.plugins =
        defaultConfig.webpackOptions.plugins || [];
      defaultConfig.webpackOptions.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        })
      );
      defaultConfig.webpackOptions.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        buildDependencies: {
          config: [__filename],
        },
      };
      defaultConfig.typescript = require.resolve('typescript');

      on('file:preprocessor', webpackPreprocessor(defaultConfig));

      return config;
    },
    baseUrl: 'http://localhost:3000',
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    modifyObstructiveCode: false,
    supportFile: './src/support/index.js',
    video: false,
    videoUploadOnPasses: false,
    videosFolder: '../../dist/cypress/apps/explorer-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/explorer-e2e/screenshots',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 900,
    testIsolation: false,
  },
  env: {
    environment: 'CUSTOM',
    networkQueryUrl: 'http://localhost:3008/graphql',
    ethUrl: 'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8',
    commitHash: 'dev',
    tsConfig: 'tsconfig.json',
    grepTags: '@regression @smoke @slow',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
    vegaWalletName: 'capsule_wallet',
    vegaWalletLocation: '~/.vegacapsule/testnet/wallet',
    vegaWalletPublicKey:
      '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
  },
});
