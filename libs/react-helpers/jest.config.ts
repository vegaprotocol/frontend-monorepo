/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'react-helpers',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/react-helpers',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
