/* eslint-disable */
export default {
  displayName: 'market-info',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/market-info',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
