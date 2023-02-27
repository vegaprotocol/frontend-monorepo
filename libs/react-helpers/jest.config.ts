/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'react-helpers',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/react-helpers',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
