/* eslint-disable */
export default {
  displayName: 'token',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/token',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  moduleNameMapper: {
    '^d3-(.*)$': `d3-$1/dist/d3-$1`,
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/__generated__/**',
    '!**/__generated___/**',
  ],
};
