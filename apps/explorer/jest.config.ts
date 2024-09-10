/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'explorer',
  preset: '../../jest.preset.js',
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
  coverageDirectory: '../../coverage/apps/explorer',
  setupFilesAfterEnv: ['./src/app/setup-tests.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
