/* eslint-disable */
module.exports = {
  displayName: 'market-list',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/market-list',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
