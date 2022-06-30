module.exports = {
  displayName: 'orders',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/orders',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
