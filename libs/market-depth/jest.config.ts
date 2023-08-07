/* eslint-disable */
export default {
  displayName: 'market-depth',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/react/babel'],
        // required for pennant to work in jest, due to having untranspiled exports
        plugins: [
          [
            '@babel/plugin-proposal-private-methods',
            {
              loose: true,
            },
          ],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/market-depth',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  // dont ignore pennant from transpilation
  transformIgnorePatterns: ['<rootDir>/node_modules/pennant'],
};
