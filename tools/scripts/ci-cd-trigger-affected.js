const execSync = require('child_process').execSync;
const {
  output,
  getBranch,
  fail,
  IS_TEST,
  validateAppName,
  IS_PULL_REQUEST,
  specialCasePrefix,
} = require('./lib/ci-functions');

const TOOLS_THAT_DEPLOY_FROM_DEVELOP = [
  'multisig-signer',
  'static',
  'ui-toolkit',
];
/**
 * Ensures that E2E test run pipelines are triggered
 *
 * @param {string[]} affected
 * @returns
 */
function testRunsToTrigger(affected) {
  let projects_e2e = [];
  if (affected.includes('governance')) {
    projects_e2e.push('governance-e2e');
  }
  if (affected.includes('trading')) {
    projects_e2e.push('trading-e2e');
  }
  if (affected.includes('explorer')) {
    projects_e2e.push('explorer-e2e');
  }
  // By default, trigger everything
  if (projects_e2e.length === 0) {
    projects_e2e = ['governance-e2e', 'trading-e2e', 'explorer-e2e'];
  }

  return projects_e2e;
}

/**
 * Preview links are deployed to S3 buckset, and domain names map on to
 * those S3 buckets. To see which bucket is used to store an application,
 * check out `publish-dist-set-vars.js`. This function generates the predictable
 * URL for a given app and branch.
 *
 * @param {string} app
 * @param {string} branch
 * @returns
 */
function getDeployPreviewLinkForAppBranch(app, branch) {
  if (!validateAppName(app)) {
    return fail('Cannot generate preview link for unknown app: ' + app);
  }
  if (!branch || branch.trim().length === 0) {
    return fail(
      `Invalid branch name specified for '${app}' preview link: ${branch}`
    );
  }

  return `https://${app}.${branch}.vega.rocks`;
}

function generateDeployPreviewLinks(affected, branch) {
  let countMajorAppsAffected = 0;

  let outputVariables = {};
  if (affected.includes('governance')) {
    outputVariables['preview_governance'] = getDeployPreviewLinkForAppBranch(
      'governance',
      branch
    );
    countMajorAppsAffected++;
  }
  if (affected.includes('trading')) {
    outputVariables['preview_trading'] = getDeployPreviewLinkForAppBranch(
      'trading',
      branch
    );
    countMajorAppsAffected++;
  }
  if (affected.includes('explorer')) {
    outputVariables['preview_explorer'] = getDeployPreviewLinkForAppBranch(
      'explorer',
      branch
    );
    countMajorAppsAffected++;
  }

  // By default, a deploy for everything is created
  if (countMajorAppsAffected === 0) {
    outputVariables['preview_governance'] = getDeployPreviewLinkForAppBranch(
      'governance',
      branch
    );
    outputVariables['preview_trading'] = getDeployPreviewLinkForAppBranch(
      'trading',
      branch
    );
    outputVariables['preview_explorer'] = getDeployPreviewLinkForAppBranch(
      'explorer',
      branch
    );
  }

  return outputVariables;
}

if (!IS_TEST) {
  let affected = [];
  let branch = getBranch();
  const BRANCH_IS_DEVELOP = branch.match(/.*develop$/);

  if (!process.env.NX_BASE || !process.env.NX_HEAD) {
    fail('Environment variables NX_BASE and NX_HEAD must be set');
  }
  try {
    // Preferably this would be a function call, but affected is not exported from nx in a nice clean way
    const affectedOutput = execSync(
      `yarn nx print-affected --base=${process.env.NX_BASE} --head=${process.env.NX_HEAD} --select=projects`
    );

    if (affectedOutput.status && affectedOutput.status !== 0) {
      fail(`Could not parse output of nx print-affected: ${affectedOutput}`);
    }

    // [0] is the yarn output, [1] is the command line, [2] is the output we want
    const affectedAppsString = affectedOutput.toString().split('\n')[2];
    if (
      !affectedAppsString ||
      affectedAppsString.trim() === '' ||
      affectedAppsString.indexOf(',') === -1
    ) {
      console.log('Nothing is affected. Nothing to do.');
      process.exit(0);
    }
    affectedAppsString.split(',').forEach((app) => {
      const a = app.trim();
      if (validateAppName(a)) {
        affected.push(a);
      }
    });
  } catch (e) {
    fail(`Error running nx print-affected: ${e}`);
  }

  console.group('>>>> debug');
  console.debug(`NX_BASE: ${process.env.NX_BASE}`);
  console.debug(`NX_HEAD: ${process.env.NX_HEAD}`);
  console.debug(`Affected: ${affected}`);
  console.debug(`Branch slug: ${branch}`);
  console.debug(`Is pull request: ${IS_PULL_REQUEST}`);

  console.debug('>>>> eof debug');
  console.groupEnd();

  const projects_e2e = testRunsToTrigger(affected);
  const environmentVariablesToSet = generateDeployPreviewLinks(
    affected,
    branch
  );

  let projects = projects_e2e.map((p) => p.replace(/-e2e/g, ''));

  //
  // Special Cases
  if (IS_PULL_REQUEST) {
    // SPECIAL CASE: multisig-signer has no e2e test but should
    // run on every pull request. Unsure why.
    if (affected.includes('multisig-signer')) {
      console.log(
        `${specialCasePrefix} tools is not affected, but deploys on every pull request. Adding to deploy queue...`
      );
      environmentVariablesToSet['preview_tools'] =
        getDeployPreviewLinkForAppBranch('multisig-signer', branch);
      projects.push('multisig-signer');
    }
  } else if (BRANCH_IS_DEVELOP) {
    // On merge to develop, updated these 3 things automatically
    // Only validated app names get here
    TOOLS_THAT_DEPLOY_FROM_DEVELOP.forEach((tool) => {
      if (affected.includes(tool)) {
        console.log(
          `${specialCasePrefix} ${tool} is not affected, but deploys from develop. Adding to deploy queue...`
        );
        projects.push(tool);
      }
    });
  }

  try {
    output('PROJECTS_E2E', JSON.stringify(projects_e2e));
    output('PROJECTS', JSON.stringify(projects));
    Object.entries(environmentVariablesToSet).forEach(([key, value]) => {
      output(key, value);
    });
  } catch (e) {
    fail('Error stringifying/exporting output', e);
  }
}

module.exports = {
  getDeployPreviewLinkForAppBranch,
  triggerTestRuns: testRunsToTrigger,
  generateDeployPreviewLinks,
};
