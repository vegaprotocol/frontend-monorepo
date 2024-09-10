/* eslint-disable */
process.env.TZ = 'GMT';
export default {
  displayName: 'governance',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/react/babel'],
        plugins: [
          ['@babel/plugin-transform-private-methods'],
          ['@babel/plugin-transform-class-properties'],
          ['@babel/plugin-transform-private-property-in-object'],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/governance',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  moduleNameMapper: {
    '^d3-(.*)$': `d3-$1/dist/d3-$1`,
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/__generated__/**',
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
