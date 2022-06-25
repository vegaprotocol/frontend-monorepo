module.exports = {
  displayName: 'fills',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/fills',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
