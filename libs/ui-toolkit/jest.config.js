module.exports = {
  displayName: 'ui-toolkit',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui-toolkit',
  setupFiles: ['./src/setup-test-env.ts'],
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
