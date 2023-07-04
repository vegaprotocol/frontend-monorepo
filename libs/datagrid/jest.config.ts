/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'datagrid',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/datagrid',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
