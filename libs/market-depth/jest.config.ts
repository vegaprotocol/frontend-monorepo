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
        plugins: [
          ['@babel/plugin-transform-private-methods'],
          ['@babel/plugin-transform-class-properties'],
          ['@babel/plugin-transform-private-property-in-object'],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/market-depth',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/pennant'],
};
