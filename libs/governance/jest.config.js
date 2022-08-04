module.exports = {
  displayName: 'governance',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/governance',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
