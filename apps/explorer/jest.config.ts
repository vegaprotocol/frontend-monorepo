/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'explorer',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/explorer',
  setupFilesAfterEnv: ['./src/app/setup-tests.ts'],
};
