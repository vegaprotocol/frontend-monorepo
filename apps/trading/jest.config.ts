/* eslint-disable */
export default {
  displayName: 'trading',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/next/babel'],
        plugins: [
          // required for pennant to work in jest, due to having untranspiled exports
          ['@babel/plugin-transform-private-methods'],
          ['@babel/plugin-transform-class-properties'],
          ['@babel/plugin-transform-private-property-in-object'],
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/trading',
  setupFilesAfterEnv: ['./setup-tests.ts'],
  // dont ignore pennant from transpilation
  transformIgnorePatterns: ['<rootDir>/node_modules/pennant'],
};
