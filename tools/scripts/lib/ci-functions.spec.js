const {
  validateAppName,
  getBranchNameFromGithubRef,
} = require('./ci-functions');
const {
  AppsThatDeployToMainnetFromDevelop,
} = require('../publish-dist-set-vars');

describe('validAppName', () => {
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
});

describe('getBranchNameFromGithubRef', () => {
  test('Handles empty refs', () => {
    // False is returned by failure
    expect(getBranchNameFromGithubRef()).toStrictEqual(false);
    expect(getBranchNameFromGithubRef('❌')).toStrictEqual(false);
    expect(getBranchNameFromGithubRef(false)).toStrictEqual(false);
    expect(getBranchNameFromGithubRef('')).toStrictEqual(false);
  });

  test('Replaces /s with -s', () => {
    expect(getBranchNameFromGithubRef('refs/heads/fix/123-test')).toStrictEqual(
      'refs-heads-fix-123-test'
    );
  });

  test('Trims a long ref to 50 characters', () => {
    expect(
      getBranchNameFromGithubRef(
        'refs/heads/this-is-a-very-long-branch-name-that-is-over-50-characters-long'
      )
    ).toStrictEqual('refs-heads-this-is-a-very-long-branch-name-that-is');
  });
});
