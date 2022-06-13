module.exports = {
  displayName: 'market-depth',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/market-depth',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
