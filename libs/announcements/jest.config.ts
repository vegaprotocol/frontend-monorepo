/* eslint-disable */
export default {
  displayName: 'announcements',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/announcements',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
