/* eslint-disable */
export default {
  displayName: 'markets',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/markets',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
