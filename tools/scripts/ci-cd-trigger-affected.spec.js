const {
  triggerTestRuns,
  getDeployPreviewLinkForAppBranch,
  generateDeployPreviewLinks,
} = require('./ci-cd-trigger-affected');

describe('getDeployPreviewLinkForAppBranch', () => {
  test('should return the deploy preview link if the app name is valid and branch is provided', () => {
    const app = 'governance';
    const branch = 'feature-branch';

    expect(getDeployPreviewLinkForAppBranch(app, branch)).toBe(
      'https://governance.feature-branch.vega.rocks'
    );
  });

  test('should fail if the app name is not valid', () => {
    const app = 'invalid-app';
    const branch = 'feature-branch';

    expect(getDeployPreviewLinkForAppBranch(app, branch)).toStrictEqual(false);
  });

  test('should fail if the branch is not provided or empty', () => {
    const app = 'governance';
    const branch = '';

    expect(getDeployPreviewLinkForAppBranch(app, branch)).toStrictEqual(false);
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
