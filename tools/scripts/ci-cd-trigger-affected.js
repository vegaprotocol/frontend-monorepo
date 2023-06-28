/**
 * Using `nx affected` as a starting point, decide which test suites must
 * run and where required generate preview links for the affected apps.
 *
 * @author Miko
 * @author Edd
 */
const execSync = require('child_process').execSync;
const { AppsThatDeployToMainnetFromDevelop } = require('./config');
const {
  output,
  getBranch,
  fail,
  IS_TEST,
  validateAppName,
  IS_PULL_REQUEST,
  specialCasePrefix,
} = require('./lib/ci-functions');

const MAIN_TOOLS = ['governance', 'trading', 'explorer'];

// Add a valid nx project here if you want it to deploy on all PRs,
// but it has no corresponding -e2e project
// TODO: Do this automatically by checking if tool-e2e exists in project
const TESTLESS_TOOLS_THAT_DEPLOY_ON_ALL_PRS = ['multisig-signer'];

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
function getDeployPreviewLink(app, branch) {
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

function getAffected() {
  if (!process.env.NX_BASE || !process.env.NX_HEAD) {
    fail('Environment variables NX_BASE and NX_HEAD must be set');
  }
  const affected = [];
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
    console.debug(
      'Nothing is affected. Nothing to do, unless there are special cases.'
    );
  } else {
    affectedAppsString.split(',').forEach((app) => {
      const a = app.trim();
      if (validateAppName(a)) {
        affected.push(a);
      }
    });
  }

  return affected;
}
/**
 * Ensures that E2E test run pipelines are triggered
 *
 * @param {string[]} affected
 * @returns
 */
function testRunsToTrigger(affected) {
  let projects_e2e = [];

  MAIN_TOOLS.forEach((tool) => {
    if (affected.includes(tool)) {
      projects_e2e.push(`${tool}-e2e`);
    }
  });
  // By default, trigger everything
  if (projects_e2e.length === 0) {
    if (!IS_TEST) {
      console.log(
        `${specialCasePrefix} no major apps are affected, but let's run the tests anyway`
      );
    }

    projects_e2e = MAIN_TOOLS.map((tool) => `${tool}-e2e`);
  }

  return projects_e2e;
}

function generateDeployPreviewLinks(affected, branch) {
  let countMajorAppsAffected = 0;

  let res = {};
  if (affected.includes('governance')) {
    res['preview_governance'] = getDeployPreviewLink('governance', branch);
    countMajorAppsAffected++;
  }
  if (affected.includes('trading')) {
    res['preview_trading'] = getDeployPreviewLink('trading', branch);
    countMajorAppsAffected++;
  }
  if (affected.includes('explorer')) {
    res['preview_explorer'] = getDeployPreviewLink('explorer', branch);
    countMajorAppsAffected++;
  }

  // We only need the multisig-signer
  if (IS_PULL_REQUEST && affected.includes('multisig-signer')) {
    environmentVariablesToSet['preview_tools'] = getDeployPreviewLink(
      'multisig-signer',
      branch
    );
  }

  // By default, a deploy for everything is created
  if (countMajorAppsAffected === 0) {
    if (!IS_TEST) {
      console.log(
        `${specialCasePrefix} no major apps are affected, but let's output preview links anyway`
      );
    }

    res['preview_governance'] = getDeployPreviewLink('governance', branch);
    res['preview_trading'] = getDeployPreviewLink('trading', branch);
    res['preview_explorer'] = getDeployPreviewLink('explorer', branch);
  }

  return res;
}

/**
 * Just some handy output for when you're debugging a pipeline.
 * Disable it by setting DEBUG=false in the pipeline environment.
 *
 * @param {string[]} affected list of nx:affected apps
 * @param {string} branch
 */
function debugOutput(affected, branch) {
  if (process.env.DEBUG && process.env.DEBUG !== 'false') {
    console.group('>>>> debug');
    console.debug(`NX_BASE: ${process.env.NX_BASE}`);
    console.debug(`NX_HEAD: ${process.env.NX_HEAD}`);
    console.debug(`Affected: ${affected}`);
    console.debug(`Branch slug: ${branch}`);
    console.debug(`Is pull request: ${IS_PULL_REQUEST}`);
    console.groupEnd();
    console.debug('>>>> eof debug');
  }
}

/**
 * Using the list of projects that were affected or selected for e2e testing, we generate
 * a list of projects that should be deployed.
 *
 * @see testRunsToTrigger
 * @param {string[]} projectsToTest a list of affected/unaffected projects that testRunsToTrigger selected
 * @param {string} branch the string name of the branch. `develop` has some special cases
 * @param {string[]} affected
 * @returns string[] a list of projects that should be deployed
 */
function mapTestsToDeploy(projectsToTest, branch, affected, isPullRequest) {
  // Catches fully qualified refs (e.g. `refs/head/develop`) and short name (`develop`)
  const BRANCH_IS_DEVELOP = branch.match(/.*develop$/);

  let projectsToDeploy = new Set(
    projectsToTest.map((p) => p.replace(/-e2e/g, ''))
  );

  //
  // Special Cases
  if (isPullRequest) {
    TESTLESS_TOOLS_THAT_DEPLOY_ON_ALL_PRS.forEach((tool) => {
      if (affected.includes(tool)) {
        if (!IS_TEST) {
          console.log(
            `${specialCasePrefix} ${tool} is affected, but deploys from develop. Adding to deploy queue...`
          );
        }

        projectsToDeploy.add(tool);
      }
    });
  }

  if (BRANCH_IS_DEVELOP) {
    // On merge/push to develop, updated these 3 things automatically
    // Only validated app names get here
    AppsThatDeployToMainnetFromDevelop.forEach((tool) => {
      if (affected.includes(tool)) {
        if (!IS_TEST) {
          console.log(
            `${specialCasePrefix} ${tool} is not affected, but deploys from develop. Adding to deploy queue...`
          );
        }
        projectsToDeploy.add(tool);
      }
    });
  }

  return Array.from(projectsToDeploy);
}

if (!IS_TEST) {
  const branch = getBranch();
  const affected = getAffected();
  debugOutput(affected, branch);

  // The list of projects here will be passed to the step `cypress` to have their smoke/regression tests run.
  const projectsToTest = testRunsToTrigger(affected);

  // The list of apps that will have their deploy previews updated
  const projectsToDeploy = mapTestsToDeploy(
    projectsToTest,
    branch,
    affected,
    IS_PULL_REQUEST
  );

  // Environment variables are used to pass the result of this script on to subsequent CI steps
  const environmentVariablesToSet = generateDeployPreviewLinks(
    affected,
    branch
  );

  try {
    output('PROJECTS_E2E', JSON.stringify(projectsToTest));
    output('PROJECTS', JSON.stringify(projectsToDeploy));

    Object.entries(environmentVariablesToSet).forEach(([key, value]) => {
      output(key, value);
    });
  } catch (e) {
    fail('Error stringifying/exporting output', e);
  }
}

module.exports = {
  getDeployPreviewLink,
  testRunsToTrigger,
  generateDeployPreviewLinks,
  mapTestsToDeploy,
};
