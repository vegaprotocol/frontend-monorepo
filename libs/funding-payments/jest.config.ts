/* eslint-disable */
export default {
  displayName: 'funding-payments',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/next/babel'],
        plugins: [['@babel/plugin-proposal-private-methods']],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/funding-payments',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
