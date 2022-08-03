module.exports = {
  displayName: 'proposals',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/proposals',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
