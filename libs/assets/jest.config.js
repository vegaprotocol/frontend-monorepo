module.exports = {
  displayName: 'assets',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/assets',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
