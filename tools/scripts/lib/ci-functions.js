const { appendFileSync, readFileSync } = require('fs');
const isString = require('lodash/isString');
const path = require('path');

const IS_TEST = process.env.NODE_ENV === 'test';
const IS_PULL_REQUEST = process.env.GITHUB_EVENT_NAME === 'pull_request';
const errorPrefix = '❌  ';

/**
 * Returns a trimmed, sanitised version of a full github ref
 *
 * @param {string} ref
 * @returns {string} trimmed, sanitised ref
 */
function getBranchNameFromGithubRef(ref) {
  try {
    const filteredRef = ref
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    if (filteredRef.length === 0) {
      return fail('Could not get branch name from GITHUB_REF_NAME' + ref);
    }

    return filteredRef;
  } catch (e) {
    return fail('Error parsing branch name from GITHUB_REF_NAME:' + ref, e);
  }
}

/**
 * Derives the branch name from the environment
 *
 * @returns {string} The branch name
 */
function getBranch() {
  if (!process.env.GITHUB_HEAD_REF && !process.env.GITHUB_REF_NAME) {
    fail(
      'Environment variables GITHUB_HEAD_REF or GITHUB_REF_NAME must be set'
    );
  }

  const branch =
    process.env.GITHUB_HEAD_REF ||
    getBranchNameFromGithubRef(process.env.GITHUB_REF_NAME);
  if (!branch) {
    fail('Could not get branch name from GITHUB_HEAD_REF or GITHUB_REF_NAME');
  }
  return branch;
}

/**
 * Simple wrapper function to either set a Github environment variable
 * or just log it out for testing
 */
function output(key, value) {
  const isRunningOnGithub = process.env.CI && process.env.GITHUB_ENV;
  if (isRunningOnGithub) {
    // share env vars across steps https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#example-of-writing-an-environment-variable-to-github_env
    appendFileSync(process.env.GITHUB_ENV, `${key}=${value}`);
  } else {
    console.log(`${key} = ${value}`);

    // Just here for testing
    return [key, value];
  }
}

/**
 * Log out an error message and quit with an error code
 */
function fail(message, e) {
  if (IS_TEST) {
    return false;
  }

  console.error(`${errorPrefix}${message}`);

  if (e) {
    console.dir(e);
  }

  process.exit(1);
}

/**
 * Validates that the
 * @param {string} app the name of the NX application or lib
 * @returns
 */
function validateAppName(app) {
  if (!app || !isString(app) || app.trim() === '') {
    return fail('Empty app name');
  }

  const NX_WORKSPACE_FILE = 'workspace.json';
  const appDir = path.dirname(__dirname);

  const f = `${appDir}/../../${NX_WORKSPACE_FILE}`;
  const workspace = JSON.parse(readFileSync(f), { encoding: 'utf-8' });
  const projects = [...Object.keys(workspace.projects)];

  if (!app) {
    return fail('`app` parameter was not set (should be an NX app/lib name)');
  }

  if (projects.indexOf(app.trim()) == -1) {
    return fail(`Project "${app}" does not exist in workspace.json`);
  }

  return true;
}

module.exports = {
  getBranchNameFromGithubRef,
  getBranch,
  output,
  fail,
  validateAppName,
  IS_TEST,
  IS_PULL_REQUEST,
};
