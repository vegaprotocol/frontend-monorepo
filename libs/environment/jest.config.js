module.exports = {
  displayName: 'environment',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/environment',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
