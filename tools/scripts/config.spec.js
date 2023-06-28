const isString = require('lodash/isString');
const {
  AppsThatDeployToMainnetFromDevelop,
  AppsThatDoNotDeployToMainnet,
} = require('./config');
const { validateAppName } = require('./publish-dist-set-vars');

describe('AppsThatDeployToMainnetFromDevelop', () => {
  test('all apps that deploy to mainnet from develop should be valid', () => {
    AppsThatDeployToMainnetFromDevelop.forEach((app) => {
      expect(isString(app)).toBe(true);
      expect(app.length).toBeGreaterThan(0);
      expect(validateAppName(app)).toBe(true, `App name "${app}" is not valid`);
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

describe('AppsThatDoNotDeployToMainnet', () => {
  test('all apps that deploy to mainnet from develop should be valid', () => {
    AppsThatDoNotDeployToMainnet.forEach((app) => {
      expect(isString(app)).toBe(true);
      expect(app.length).toBeGreaterThan(0);
      expect(validateAppName(app)).toBe(true, `App name "${app}" is not valid`);
    });
  });

  test('should contain "trading"', () => {
    expect(AppsThatDoNotDeployToMainnet.has('trading')).toBe(true);
  });
});
