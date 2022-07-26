/* eslint-disable */
export default {
  displayName: 'deposits',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/deposits',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
