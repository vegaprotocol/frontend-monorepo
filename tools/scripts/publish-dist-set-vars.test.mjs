import {
  validateAppName,
  AppsThatDeployToMainnetFromDevelop,
  S3BucketNameForApp,
  getBucketName,
  getEnvironmentFromDevelop,
} from './publish-dist-set-vars.mjs';
import { test } from 'tape';

test(`getValidAppName returns true for major apps, because they exist in '../../workspace.json'`, (t) => {
  t.ok(validateAppName('trading'), 'trading is valid');
  t.ok(validateAppName('explorer'), 'governance is valid');
  t.ok(validateAppName('governance'), 'explorer is valid');
  t.end();
});

test(`getValidAppName returns true for all AppsThatDeployToMainnet, because they exist in '../../workspace.json'`, (t) => {
  Array.from(AppsThatDeployToMainnetFromDevelop).forEach((a) => {
    t.ok(validateAppName(a), `'${a}' is valid`);
  });

  t.end();
});

test(`getValidAppName returns false for apps that have invalid names or are not in workspace.json, '../../workspace.json'`, (t) => {
  t.notOk(validateAppName(''), 'blank string is invalid');
  t.notOk(validateAppName('❌'), 'X emoji is invalid');
  t.notOk(
    validateAppName('random-made-up-app'),
    'random-made-up-app emoji is invalid'
  );
  t.end();
});

test('Every app that deploys to mainnet from develop has an explicit bucket set', (t) => {
  Array.from(AppsThatDeployToMainnetFromDevelop).forEach((a) => {
    t.ok(!!S3BucketNameForApp[a], `'${a}' has a bucket`);
  });

  t.end();
});

test('getBucketName works for known and unknown envs for major apps', (t) => {
  t.comment('- Trading envs');
  t.notOk(
    getBucketName('trading', 'mainnet'),
    'trading does not deploy to mainnet'
  );
  t.equal(
    getBucketName('trading', 'testnet'),
    'trading.fairground.wtf',
    'trading testnet bucket is known'
  );
  t.equal(
    getBucketName('trading', 'dev'),
    'trading.dev.vega.rocks',
    'trading dev bucket is known'
  );
  t.equal(
    getBucketName('trading', 'magical-test-network'),
    'trading.magical-test-network.vega.rocks',
    'trading dev bucket for new network'
  );

  t.comment('- Explorer envs');
  t.equal(
    getBucketName('explorer', 'mainnet'),
    'explorer.vega.xyz',
    'mainnet explorer bucket is known'
  );
  t.equal(
    getBucketName('explorer', 'testnet'),
    'explorer.fairground.wtf',
    'testnet explorer bucket is known'
  );
  t.equal(
    getBucketName('explorer', 'dev'),
    'explorer.dev.vega.rocks',
    'testnet dev bucket is known'
  );
  t.equal(
    getBucketName('explorer', 'magical-test-network'),
    'explorer.magical-test-network.vega.rocks',
    'explorer dev bucket for new network'
  );

  t.comment('- Governance envs');
  t.equal(
    getBucketName('governance', 'mainnet'),
    'governance.vega.xyz',
    'mainnet governance bucket is known'
  );
  t.equal(
    getBucketName('governance', 'testnet'),
    'governance.fairground.wtf',
    'testnet governance bucket is known'
  );
  t.equal(
    getBucketName('governance', 'dev'),
    'governance.dev.vega.rocks',
    'dev governance bucket is known'
  );
  t.equal(
    getBucketName('governance', 'magical-test-network'),
    'governance.magical-test-network.vega.rocks',
    'explorer dev bucket for new network'
  );
  t.end();
});

test('getBucketName works for hypothetical apps', (t) => {
  t.equal(
    getBucketName('testy-mctestface', 'mainnet'),
    'testy-mctestface.vega.xyz',
    'mainnet made up app (testy-mctestface)'
  );
  t.equal(
    getBucketName('dolphinsdolphinsdolphins', 'testnet'),
    'dolphinsdolphinsdolphins.fairground.wtf',
    'testnet made up app (dolphinsdolphinsdolphins)'
  );
  t.equal(
    getBucketName('kittens', 'dev'),
    'kittens.dev.vega.rocks',
    'dev made up app (kittens)'
  );
  t.equal(
    getBucketName('this-is-not-an-app', 'magical-test-network'),
    'this-is-not-an-app.magical-test-network.vega.rocks',
    'made up network, made up app'
  );

  t.end();
});

test('Every app that deploys to mainnet from develop should be special cased', (t) => {
  Array.from(AppsThatDeployToMainnetFromDevelop).forEach((a) => {
    const knownBucket = S3BucketNameForApp[a];
    Array.from(['mainnet', 'testnet', 'dev', 'magical-test-network']).forEach(
      (n) => {
        t.equal(
          getBucketName(a, n),
          knownBucket,
          `${a} on ${n} should go to ${knownBucket}`
        );
      }
    );
  });
  t.end();
});

test('getEnvironmentFromDevelop returns the default environment for most apps, or mainnet for special cases', (t) => {
  t.equal(
    getEnvironmentFromDevelop('trading'),
    'stagnet1',
    'trading commits on stagnet1 deploy to stagnet1'
  );
  t.equal(
    getEnvironmentFromDevelop('liquidity-provision-dashboard'),
    'stagnet1',
    'liquidity-provision-dashboard deploys to stagnet1 by default'
  );
  t.equal(
    getEnvironmentFromDevelop('static'),
    'mainnet',
    'static always deploys to the mainnet environment'
  );

  t.end();
});
