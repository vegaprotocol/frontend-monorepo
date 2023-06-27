const {
  validateAppName,
  AppsThatDeployToMainnetFromDevelop,
  S3BucketNameForApp,
  getBucketName,
  getEnvironmentFromDevelop,
} = require('./publish-dist-set-vars.js');

describe('Tests for publish-dist-set-vars', () => {
  test(`getValidAppName returns true for major apps, because they exist in '../../workspace.json'`, () => {
    expect(validateAppName('trading')).toBe(true);
    expect(validateAppName('explorer')).toBe(true);
    expect(validateAppName('governance')).toBe(true);
  });

  test(`getValidAppName returns true for all AppsThatDeployToMainnet, because they exist in '../../workspace.json'`, () => {
    AppsThatDeployToMainnetFromDevelop.forEach((a) => {
      expect(validateAppName(a)).toBe(true);
    });
  });

  test(`getValidAppName returns false for apps that have invalid names or are not in workspace.json, '../../workspace.json'`, () => {
    expect(validateAppName('')).toBe(false);
    expect(validateAppName('❌')).toBe(false);
    expect(validateAppName('random-made-up-app')).toBe(false);
  });

  test('Every app that deploys to mainnet from develop has an explicit bucket set', () => {
    AppsThatDeployToMainnetFromDevelop.forEach((a) => {
      expect(!!S3BucketNameForApp[a]).toBe(true);
    });
  });

  test('getBucketName works for known and unknown envs for major apps', () => {
    expect(getBucketName('trading', 'mainnet')).toBe(false);
    expect(getBucketName('trading', 'testnet')).toBe('trading.fairground.wtf');
    expect(getBucketName('trading', 'dev')).toBe('trading.dev.vega.rocks');
    expect(getBucketName('trading', 'magical-test-network')).toBe(
      'trading.magical-test-network.vega.rocks'
    );

    expect(getBucketName('explorer', 'mainnet')).toBe('explorer.vega.xyz');
    expect(getBucketName('explorer', 'testnet')).toBe(
      'explorer.fairground.wtf'
    );
    expect(getBucketName('explorer', 'dev')).toBe('explorer.dev.vega.rocks');
    expect(getBucketName('explorer', 'magical-test-network')).toBe(
      'explorer.magical-test-network.vega.rocks'
    );

    expect(getBucketName('governance', 'mainnet')).toBe('governance.vega.xyz');
    expect(getBucketName('governance', 'testnet')).toBe(
      'governance.fairground.wtf'
    );
    expect(getBucketName('governance', 'dev')).toBe(
      'governance.dev.vega.rocks'
    );
    expect(getBucketName('governance', 'magical-test-network')).toBe(
      'governance.magical-test-network.vega.rocks'
    );
  });

  test('getBucketName works for hypothetical apps', () => {
    expect(getBucketName('testy-mctestface', 'mainnet')).toBe(
      'testy-mctestface.vega.xyz'
    );
    expect(getBucketName('dolphinsdolphinsdolphins', 'testnet')).toBe(
      'dolphinsdolphinsdolphins.fairground.wtf'
    );
    expect(getBucketName('kittens', 'dev')).toBe('kittens.dev.vega.rocks');
    expect(getBucketName('this-is-not-an-app', 'magical-test-network')).toBe(
      'this-is-not-an-app.magical-test-network.vega.rocks'
    );
  });

  test('Every app that deploys to mainnet from develop should be special cased', () => {
    AppsThatDeployToMainnetFromDevelop.forEach((a) => {
      const knownBucket = S3BucketNameForApp[a];
      ['mainnet', 'testnet', 'dev', 'magical-test-network'].forEach((n) => {
        expect(getBucketName(a, n)).toEqual(knownBucket);
      });
    });
  });

  test('getEnvironmentFromDevelop returns the default environment for most apps, or mainnet for special cases', () => {
    expect(getEnvironmentFromDevelop('trading')).toEqual('stagnet1');
    expect(getEnvironmentFromDevelop('liquidity-provision-dashboard')).toEqual(
      'stagnet1'
    );
    expect(getEnvironmentFromDevelop('static')).toEqual('mainnet');
  });
});
