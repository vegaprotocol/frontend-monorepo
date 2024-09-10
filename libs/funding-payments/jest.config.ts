/* eslint-disable */
export default {
  displayName: 'funding-payments',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/next/babel'],
        // required for pennant to work in jest, due to having untranspiled exports
        plugins: [['@babel/plugin-proposal-private-methods']],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/funding-payments',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  // dont ignore pennant from transpilation
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
