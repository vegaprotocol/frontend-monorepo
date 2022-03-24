module.exports = {
  displayName: 'order-list',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/order-list',
  setupFilesAfterEnv: ['./src/setup-tests.ts'],
};
