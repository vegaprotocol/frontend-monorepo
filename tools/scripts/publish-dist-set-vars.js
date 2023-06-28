/**
 * A script that determines which S3 storage bucket an application build
 * should be deployed to, given an application name and a branch or environment
 * name.
 *
 * This is used in a github action to update dev, testnet, stagnet and some mainnet
 * deploys for the apps in the frontend monorepo.
 *
 * You should be able to get away with just updating the configuration variables at the
 * top of the script
 *
 * You can run the test suite with `npm run test:human` (nice formatting) or just `npm test)`
 *
 * In CI this is run by `publish-dist.yml`
 */
const {
  validateAppName,
  output,
  fail,
  IS_TEST,
} = require('./lib/ci-functions');

const domains = {
  mainnet: 'vega.xyz',
  testnet: 'fairground.wtf',
  default: 'vega.rocks',
};

const AppsThatDeployToMainnetFromDevelop = new Set([
  'multisig-signer',
  'static',
  'ui-toolkit',
]);
const AppsThatDoNotDeployToMainnet = new Set(['trading']);
const S3BucketNameForApp = {
  'multisig-signer': 'tools.vega.xyz',
  static: 'static.vega.xyz',
  'ui-toolkit': 'ui.vega.rocks',
};
DEFAULT_ENVIRONMENT = 'stagnet1';

/**
 * Extract the app name from the command line
 * @returns {string} App name
 */
function getApp() {
  const app = process.argv.pop();
  try {
    return validateAppName(app);
  } catch (e) {
    return fail(
      `Could not read workspace configuration (workspace.json in the project root)`,
      e
    );
  }
}

/**
 * Extract the git ref from the environment
 * @returns {string} Git reference
 */
function getRef() {
  const ref = process.env.GITHUB_REF;

  if (!ref) {
    return fail(
      `Error: 'ref' was not set (should be a fully-qualified git ref set in GITHUB_REF)`
    );
  }

  return ref;
}

/**
 * Derives the S3 bucket name from the environment
 *
 * @param {string} app The application name
 * @param {string} envName The git reference
 * @see getApp
 * @see getRef
 * @returns {string} full S3 storage bucket name
 */
function getBucketName(app, envName) {
  if (AppsThatDoNotDeployToMainnet.has(app) && envName === 'mainnet') {
    return fail(`${app} does not deploy to mainnet`);
  }

  if (AppsThatDeployToMainnetFromDevelop.has(app)) {
    return S3BucketNameForApp[app];
  }

  // mainnet / fairground apps do not contain environment name in the DNS
  if (envName === 'mainnet') {
    return `${app}.${domains.mainnet}`;
  } else if (envName === 'testnet') {
    return `${app}.${domains.testnet}`;
  }

  return `${app}.${envName}.${domains.default}`;
}

/**
 * Determines an environment for commits on develop. Required because
 * some applications have special cases.
 *
 * @param {string} environment name
 * @returns {string} environment name
 */
function getEnvironmentFromDevelop(app) {
  if (AppsThatDeployToMainnetFromDevelop.has(app)) {
    return 'mainnet';
  }

  return DEFAULT_ENVIRONMENT;
}

function getEnvironmentFromGitRef(ref) {
  // we take last part of release/* branch as environment name
  try {
    let envName = ref.split('/').slice(-1).toString();

    if (envName.trim() === '') {
      throw new Error('Ref name returned empty');
    }

    return envName;
  } catch (e) {
    return fail(`Could not parse release name from release ref "${ref}"`, e);
  }
}

function getEnv(app, ref) {
  if (ref.indexOf('release/') != -1) {
    return getEnvironmentFromGitRef(ref);
  } else if (ref.endsWith('develop')) {
    // normal apps are deployed from develop to stagnet1
    return getEnvironmentFromDevelop(app);
  } else if (ref.endsWith('main')) {
    return 'mainnet';
  } else {
    // Github should not have triggered in this case
    fail(
      `Environment name could not be determined from ref (got "${ref}"), expected something with 'main' or 'develop' or 'release'`
    );
  }
}

/* Runs all the default commands unless we're testing the app */
if (!IS_TEST) {
  // ============================================
  // = Check that app is set and is a valid app =
  // ============================================
  // app is taken from gha templating ${{matrix.app}}`
  const app = getApp();
  // ref is taken from the environment variable GITHUB_REF
  const ref = getRef();

  const envName = getEnv(app, ref);
  const bucketName = getBucketName(app, envName);

  if (AppsThatDoNotDeployToMainnet.has(app) && envName === 'mainnet') {
    fail(`${app} does not deploy to ${envName}`);
  }

  output('BUCKET_NAME', bucketName);
  output('ENV_NAME', envName);
}

module.exports = {
  validateAppName,
  AppsThatDeployToMainnetFromDevelop,
  S3BucketNameForApp,
  getBucketName,
  getEnvironmentFromDevelop,
};
