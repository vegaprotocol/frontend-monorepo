const config = {
  displayName: 'browser-wallet-ui',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/frontend/$1',
  },
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/frontend/setup-tests.ts'],
  globalSetup: './src/frontend/global-setup.ts',
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!test/**'],
  coverageDirectory: 'coverage/frontend',
  coverageThreshold: {
    global: {
      branches: 98.08,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
