/* eslint-disable */
export default {
  displayName: 'trades',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/trades',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
