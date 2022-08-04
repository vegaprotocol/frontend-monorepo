/* eslint-disable */
export default {
  displayName: 'candles-chart',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/candles-chart',
  setupFiles: ['jest-canvas-mock'],
};
