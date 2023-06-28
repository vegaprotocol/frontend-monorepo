const isString = require('lodash/isString');
const {
  AppsThatDeployToMainnetFromDevelop,
  AppsThatDoNotDeployToMainnet,
} = require('./config');
const { validateAppName } = require('./publish-dist-set-vars');

describe('AppsThatDeployToMainnetFromDevelop configuration test', () => {
  test('all apps that deploy to mainnet from develop should be valid', () => {
    AppsThatDeployToMainnetFromDevelop.forEach((app) => {
      expect(isString(app)).toBe(
        true,
        `Invalid non-string in AppsThatDeployToMainnetFromDevelop`
      );
      expect(app.length).toBeGreaterThan(
        0,
        `Invalid empty string in AppsThatDeployToMainnetFromDevelop`
      );
      expect(app.endsWith('-e2e')).toBe(false, 'Do not deploy e2e apps');
      expect(validateAppName(app)).toBe(
        true,
        `App name "${app}" is not in nx project`
      );
    });
  });

  test('should contain "multisig-signer"', () => {
    expect(AppsThatDeployToMainnetFromDevelop.has('static')).toBe(true);
  });

  test('should contain "static"', () => {
    expect(AppsThatDeployToMainnetFromDevelop.has('static')).toBe(true);
  });

  test('should contain "ui-toolkit"', () => {
    expect(AppsThatDeployToMainnetFromDevelop.has('ui-toolkit')).toBe(true);
  });
});

describe('AppsThatDoNotDeployToMainnet configuration test', () => {
  test('all apps that deploy to mainnet from develop should be valid', () => {
    AppsThatDoNotDeployToMainnet.forEach((app) => {
      expect(isString(app)).toBe(
        true,
        'invalid non-string in AppsThatDoNotDeployToMainnet'
      );
      expect(app.length).toBeGreaterThan(
        0,
        'invalid empty string in AppsThatDoNotDeployToMainnet'
      );
      expect(app.endsWith('-e2e')).toBe(false, '-e2e suites never deploy');
      expect(validateAppName(app)).toBe(
        true,
        `App name "${app}" is not in nx project`
      );
    });
  });

  test('should contain "trading"', () => {
    expect(AppsThatDoNotDeployToMainnet.has('trading')).toBe(true);
  });
});
