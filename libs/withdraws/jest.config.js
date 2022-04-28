module.exports = {
  displayName: 'withdraws',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/withdraws',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
