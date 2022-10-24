/* eslint-disable */
export default {
  displayName: 'positions',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/positions',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
