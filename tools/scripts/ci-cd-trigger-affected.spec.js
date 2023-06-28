const {
  testRunsToTrigger,
  getDeployPreviewLink,
  generateDeployPreviewLinks,
  mapTestsToDeploy,
} = require('./ci-cd-trigger-affected');

describe('getDeployPreviewLink', () => {
  test('should return the deploy preview link if the app name is valid and branch is provided', () => {
    const app = 'governance';
    const branch = 'feature-branch';

    expect(getDeployPreviewLink(app, branch)).toBe(
      'https://governance.feature-branch.vega.rocks'
    );
  });

  test('should fail if the app name is not valid', () => {
    const app = 'invalid-app';
    const branch = 'feature-branch';

    expect(getDeployPreviewLink(app, branch)).toStrictEqual(false);
  });

  test('should fail if the branch is not provided or empty', () => {
    const app = 'governance';
    const branch = '';

    expect(getDeployPreviewLink(app, branch)).toStrictEqual(false);
  });
});

describe('testRunsToTrigger', () => {
  test('should return an array with "governance-e2e" if "governance" is affected', () => {
    const affected = ['governance'];
    expect(testRunsToTrigger(affected)).toEqual(['governance-e2e']);
  });

  test('should return an array with "trading-e2e" if "trading" is affected', () => {
    const affected = ['trading'];
    expect(testRunsToTrigger(affected)).toEqual(['trading-e2e']);
  });

  test('should return an array with "explorer-e2e" if "explorer" is affected', () => {
    const affected = ['explorer'];
    expect(testRunsToTrigger(affected)).toEqual(['explorer-e2e']);
  });

  test('should return an array with all three projects if all are affected', () => {
    const affected = ['governance', 'trading', 'explorer'];
    expect(testRunsToTrigger(affected)).toEqual([
      'governance-e2e',
      'trading-e2e',
      'explorer-e2e',
    ]);
  });

  test('should return an array with all three projects if no specific projects are affected', () => {
    const affected = ['other'];
    expect(testRunsToTrigger(affected)).toEqual([
      'governance-e2e',
      'trading-e2e',
      'explorer-e2e',
    ]);
  });
});

describe('generateDeployPreviewLinks', () => {
  test('should return an object with a link for "governance" app if it is affected', () => {
    const affected = ['governance'];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_governance: 'https://governance.feature-branch.vega.rocks',
    });
  });

  test('should return an object with a link for "trading" app if it is affected', () => {
    const affected = ['trading'];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_trading: 'https://trading.feature-branch.vega.rocks',
    });
  });

  test('should return an object with a link for "explorer" app if it is affected', () => {
    const affected = ['explorer'];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_explorer: 'https://explorer.feature-branch.vega.rocks',
    });
  });

  test('should return an object with links for all apps if all are affected', () => {
    const affected = ['governance', 'trading', 'explorer'];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_governance: 'https://governance.feature-branch.vega.rocks',
      preview_trading: 'https://trading.feature-branch.vega.rocks',
      preview_explorer: 'https://explorer.feature-branch.vega.rocks',
    });
  });

  test('should return an object with links for all apps if no specific apps are affected', () => {
    const affected = ['other'];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_governance: 'https://governance.feature-branch.vega.rocks',
      preview_trading: 'https://trading.feature-branch.vega.rocks',
      preview_explorer: 'https://explorer.feature-branch.vega.rocks',
    });
  });

  test('should return an object with all links if no apps are affected', () => {
    const affected = [];
    const branch = 'feature-branch';
    const output = generateDeployPreviewLinks(affected, branch);
    expect(output).toEqual({
      preview_governance: 'https://governance.feature-branch.vega.rocks',
      preview_trading: 'https://trading.feature-branch.vega.rocks',
      preview_explorer: 'https://explorer.feature-branch.vega.rocks',
    });
  });
});

describe('mapTestsToDeploy', () => {
  test('should add affected "TESTLESS_TOOLS_THAT_DEPLOY_ON_ALL_PRS" to deploy queue on pull request', () => {
    const projectsToTest = ['project1-e2e', 'project2-e2e'];
    const affected = ['project1', 'project2', 'multisig-signer'];
    const branch = 'main';

    const result = mapTestsToDeploy(projectsToTest, branch, affected, true);

    expect(result).toContain('project1');
    expect(result).toContain('project2');
    expect(result).toContain('multisig-signer');
  });

  test('even if a special case is already affected', () => {
    const projectsToTest = [];
    const affected = ['multisig-signer'];
    const branch = 'main';

    const result = mapTestsToDeploy(projectsToTest, branch, affected, true);

    expect(result).toContain('multisig-signer');
    expect(result.length).toStrictEqual(1);
  });

  test('IS_PULL_REQUEST special case should not be deployed on non-prs', () => {
    const projectsToTest = [];
    const affected = ['multisig-signer'];
    const branch = 'main';

    const result = mapTestsToDeploy(projectsToTest, branch, affected, false);

    expect(result).not.toContain('multisig-signer');
    expect(result.length).toStrictEqual(0);
  });

  test('should add affected "AppsThatDeployToMainnetFromDevelop" to deploy queue on develop branch', () => {
    const projectsToTest = ['libs/accounts', 'libs-apollo-client'];
    const branch = 'develop';
    const affected = ['multisig-signer', 'static', 'ui-toolkit'];

    const result = mapTestsToDeploy(projectsToTest, branch, affected, false);

    expect(result).toContain('multisig-signer');
    expect(result).toContain('static');
    expect(result).toContain('ui-toolkit');
  });

  test('should not add affected "AppsThatDeployToMainnetFromDevelop" to deploy queue on any other branch', () => {
    const projectsToTest = ['trading', 'explorer'];
    const branch = 'main';
    const affected = ['multisig-signer', 'static', 'ui-toolkit'];

    const result = mapTestsToDeploy(projectsToTest, branch, affected, false);

    expect(result).not.toContain('multisig-signer');
    expect(result).not.toContain('static');
    expect(result).not.toContain('ui-toolkit');
  });

  test('should not add any other item to the deploy queue', () => {
    const projectsToTest = ['trading-e2e', 'explorer-e2e'];
    const branch = 'develop';
    const affected = ['trading', 'explorer'];

    const result = mapTestsToDeploy(projectsToTest, branch, affected);

    expect(result.length).toEqual(2);
    expect(result).toContain('trading');
    expect(result).toContain('explorer');
  });
});
