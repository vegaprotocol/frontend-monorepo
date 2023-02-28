/* eslint-disable */
export default {
  displayName: 'datagrid',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/datagrid',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
