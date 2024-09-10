/* eslint-disable */
process.env.TZ = 'UTC';
export default {
  displayName: 'explorer',
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
  coverageDirectory: '../../coverage/apps/explorer',
  setupFilesAfterEnv: ['./src/app/setup-tests.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/wagmi'],
};
