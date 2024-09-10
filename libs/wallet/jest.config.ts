/* eslint-disable */
import { readFileSync } from 'fs';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8')
);

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

export default {
  displayName: 'wallet',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/react/babel'],
        plugins: [
          ['@babel/plugin-transform-private-methods'],
          ['@babel/plugin-transform-class-properties'],
          ['@babel/plugin-transform-private-property-in-object'],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'jsdom',
  coverageDirectory: '../../coverage/libs/wallet',
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
