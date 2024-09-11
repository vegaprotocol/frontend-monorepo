/* eslint-disable */
export default {
  displayName: 'funding-payments',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
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
  coverageDirectory: '../../coverage/libs/funding-payments',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
