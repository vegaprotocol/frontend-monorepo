/* eslint-disable */
module.exports = {
  displayName: 'ui-toolkit',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui-toolkit',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
