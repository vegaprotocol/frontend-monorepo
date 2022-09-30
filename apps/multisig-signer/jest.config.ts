/* eslint-disable */
export default {
  displayName: 'multisig-signer',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/multisig-signer',
  setupFilesAfterEnv: ['./src/app/setup-tests.ts'],
};
