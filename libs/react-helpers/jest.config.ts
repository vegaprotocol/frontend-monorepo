/* eslint-disable */
module.exports = {
  displayName: 'react-helpers',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/react-helpers',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
