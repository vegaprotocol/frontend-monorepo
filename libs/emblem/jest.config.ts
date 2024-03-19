/* eslint-disable */
export default {
  displayName: 'emblem',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/emblem',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
