const fs = require('fs');
// https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program
var argv = require('minimist')(process.argv.slice(2));
// ref is in form of refs/head/blablabla
var ref = argv['ref'];
// app is taken from gha templating ${{matrix.app}}
var app = argv['app'];
console.log(`ref is: ${ref}`);
var envName = '';
var domain = 'vega.rocks';
var bucketName = '';

if (ref.contains('release/')) {
  // we take last part of release/* branch as environment name
  envName = argv['ref'].split('/').slice(-1);
  console.log(`env name from release/* ref is: ${envName}`);
} else if (ref.endsWith('develop')) {
  // normal apps are deployed from develop to stagnet1
  envName = 'stagnet1';
  // those apps are deployed from develop to mainnet
  if (app == 'multisig-signer') {
    envName = 'mainnet';
    bucketName = 'tools.vega.xyz';
  } else if (app == 'static') {
    envName = 'mainnet';
    bucketName = 'static.vega.xyz';
  } else if (app == 'ui-toolkit') {
    envName = 'mainnet';
    bucketName = 'ui.vega.rocks';
  }
} else if (ref.endsWith('main')) {
  envName = 'mainnet';
}

// mainnet apps do not contain
if (envName == 'mainnet') {
  domain = 'vega.xyz';
  if (!bucketName) {
    bucketName = `${app}.${domain}`;
  }
} else if (envName == 'testnet') {
  domain = 'fairground.wtf';
  if (!bucketName) {
    bucketName = `${app}.${domain}`;
  }
}
if (!bucketName) {
  bucketName = `${app}.${envName}.${domain}`;
}

// share env vars accross steps https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#example-of-writing-an-environment-variable-to-github_env
fs.appendFileSync(process.env.GITHUB_ENV, `BUCKET_NAME=${bucketName}`);
fs.appendFileSync(process.env.GITHUB_ENV, `ENV_NAME=${envName}`);
