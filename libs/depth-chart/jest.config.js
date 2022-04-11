module.exports = {
  displayName: 'depth-chart',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/depth-chart',
  setupFiles: ['jest-canvas-mock'],
};
