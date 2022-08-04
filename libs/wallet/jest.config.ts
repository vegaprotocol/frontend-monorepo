/* eslint-disable */
export default {
  displayName: 'wallet',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/wallet',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
