module.exports = {
  displayName: 'token',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
    '/.[jt]sx?$/': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/token',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
  moduleNameMapper: {
    '^d3-(.*)$': `d3-$1/dist/d3-$1`,
  },
};
