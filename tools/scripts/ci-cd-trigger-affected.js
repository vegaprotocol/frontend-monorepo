const execSync = require('child_process').execSync;
const {
  getBranch,
  fail,
  IS_TEST,
  validateAppName,
  IS_PULL_REQUEST,
} = require('./lib/ci-functions');

let affected = [];
let branch = getBranch();
const BRANCH_IS_DEVELOP = branch.match(/.*develop$/);

if (!IS_TEST) {
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

  console.debug('>>>> debug');
  console.debug(`NX_BASE: ${process.env.NX_BASE}`);
  console.debug(`NX_HEAD: ${process.env.NX_HEAD}`);
  console.debug(`Affected: ${affected}`);
  console.debug(`Branch slug: ${branch}`);
  console.debug('>>>> eof debug');
}

function triggerTestRuns(affected) {
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

function getDeployPreviewLinkForAppBranch(app, branch) {
  if (!validateAppName(app)) {
    fail('Cannot generate preview link for unknown app: ' + app);
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
  if (countMajorAppsAffected.length === 0) {
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

const projects_e2e = triggerTestRuns(affected);
const environmentVariablesToSet = generateDeployPreviewLinks(affected, branch);

let projects = projects_e2e.map((p) => p.replace(/-e2e/g, '')).join();

if (IS_PULL_REQUEST) {
  if (affected.includes('multisig-signer')) {
    console.log('Tools are affected');
    console.log('Deploying tools on preview');
    environmentVariablesToSet['preview_tools'] =
      getDeployPreviewLinkForAppBranch(tools, branch);
    projects += ', multisig-signer';
  }
} else if (BRANCH_IS_DEVELOP) {
  if (affected.includes('multisig-signer')) {
    console.log('Tools are affected');
    console.log('Deploying tools on s3');
    projects += ', multisig-signer';
  }
  if (affected.includes('static')) {
    console.log('Static is affected');
    console.log('Deploying static on s3');
    projects += ', static';
  }
  if (affected.includes('ui-toolkit')) {
    console.log('UI Toolkit is affected');
    console.log('Deploying UI Toolkit on s3');
    projects += ', ui-toolkit';
  }
}

console.dir(projects_e2e);
//projects_e2e = "[" + projects_e2e.join(",") + "]";
//projects = "[" + projects + "]";
console.dir(projects);
