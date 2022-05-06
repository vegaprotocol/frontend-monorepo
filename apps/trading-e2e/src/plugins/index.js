/// <reference types="cypress" />

const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
import { addMatchImageSnapshotPlugin } from '@pkerschbaum/cypress-image-snapshot/lib/plugin';
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on(
    'file:preprocessor',
    webpackPreprocessor({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
          plugins: [
            new TsconfigPathsPlugin({
              configFile: config.env.tsConfig,
              extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
            }),
          ],
          fallback: {
            path: require.resolve('path-browserify'),
          },
        },
        module: {
          rules: [
            {
              test: /\.([jt])sx?$/,
              loader: 'ts-loader',
              exclude: [/node_modules/],
              options: {
                configFile: config.env.tsConfig,
                // https://github.com/TypeStrong/ts-loader/pull/685
                experimentalWatchApi: true,
                transpileOnly: true,
              },
            },
            {
              test: /\.feature$/,
              use: [
                {
                  loader: 'cypress-cucumber-preprocessor/loader',
                },
              ],
            },
            {
              test: /\.features$/,
              use: [
                {
                  loader: 'cypress-cucumber-preprocessor/lib/featuresLoader',
                },
              ],
            },
          ],
        },
        plugins: [
          new ForkTsCheckerWebpackPlugin({
            typescript: {
              enabled: true,
              configFile: config.env.tsConfig,
            },
          }),
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
        ],
        externals: [nodeExternals()],
      },
    })
  );
  addMatchImageSnapshotPlugin(on, config);
};
