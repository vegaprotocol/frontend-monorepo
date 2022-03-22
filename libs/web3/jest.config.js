module.exports = {
  displayName: 'web3',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/web3',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
