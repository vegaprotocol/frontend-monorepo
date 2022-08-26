const path = require('node:path');
const https = require('node:https');
const { execSync } = require('node:child_process');

const execWrap = require('./utils/exec-wrap');
const githubRequest = require('./utils/github-request');
const wrapCli = require('./utils/wrap-cli');
const launchGithubWorkflow = require('./utils/github-workflow');

const typesProjectJson = require(path.join(
  __dirname,
  '..',
  'libs',
  'types',
  'project.json'
));

const TYPE_UPDATE_BRANCH = 'fix/types';
const appRoot = path.join(__dirname, '..');

const cliArgsSpecs = [
  {
    name: 'apiUrl',
    arg: 'url',
    required: true,
    validate: (value) => {
      try {
        new URL(value);
      } catch (err) {
        throw new Error(
          `Invalid url found: ${value}. Make sure you pass in a valid url using the "--url" flag.`
        );
      }
    },
  },
  {
    name: 'apiVersion',
    arg: 'version',
    required: true,
  },
  {
    name: 'apiCommitHash',
    arg: 'commit',
    required: true,
  },
  {
    name: 'apiRepoName',
    arg: 'repo',
    default: 'vega',
  },
  {
    name: 'apiRepoOwner',
    arg: 'owner',
    default: 'vegaprotocol',
  },
  {
    name: 'frontendRepoName',
    arg: 'fe-repo',
    default: 'frontend-monorepo',
  },
  {
    name: 'frontendRepoOwner',
    arg: 'fe-owner',
    default: 'vegaprotocol',
  },
  {
    name: 'githubAuthToken',
    arg: 'token',
    required: true,
  },
];

const getGenerateCmd = (projectJson) => {
  if (
    projectJson &&
    projectJson.targets &&
    projectJson.targets.generate &&
    projectJson.targets.generate.options &&
    projectJson.targets.generate.options.commands
  ) {
    return projectJson.targets.generate.options.commands.join(' && ');
  }
};

const launchGitWorkflow = ({
  apiVersion,
  apiCommitHash,
  frontendRepoOwner,
  frontendRepoName,
}) => {
  const branchMatches = execWrap({
    cmd: `git ls-remote --heads origin ${TYPE_UPDATE_BRANCH}`,
    errMessage: `Error checking if the branch "${TYPE_UPDATE_BRANCH}" exists on the origin.`,
  });
  const localBranches = execWrap({
    cmd: 'git branch',
    errMessage: `Error getting local branch names.`,
  });

  if (
    branchMatches.includes(TYPE_UPDATE_BRANCH) ||
    localBranches.includes(TYPE_UPDATE_BRANCH)
  ) {
    const currentBranchName = execWrap({
      cmd: `git branch --show-current`,
      errMessage: `Error getting current branch name.`,
    });

    if (currentBranchName !== TYPE_UPDATE_BRANCH) {
      execWrap({
        cmd: `git checkout ${TYPE_UPDATE_BRANCH}`,
        errMessage: `There was an error trying to check out the branch "${TYPE_UPDATE_BRANCH}".`,
      });
    }
  } else {
    execWrap({
      cmd: `git checkout -b ${TYPE_UPDATE_BRANCH}`,
      errMessage: `There was an error trying to check out the branch "${TYPE_UPDATE_BRANCH}".`,
    });
  }

  execWrap({
    cmd: `git add .`,
    errMessage: `Error staging changed files.`,
  });

  execWrap({
    cmd: `git commit -m 'chore: update types for v${apiVersion} on HEAD:${apiCommitHash}' --no-verify`,
    errMessage: `Error checking if the branch "${TYPE_UPDATE_BRANCH}" exists on the origin.`,
  });

  execWrap({
    cmd: `git push -u ssh://github.com/${frontendRepoOwner}/${frontendRepoName}.git ${TYPE_UPDATE_BRANCH} --no-verify`,
    errMessage: 'Error pushing changes.',
  });
};

const run = async ({
  apiUrl,
  apiVersion,
  apiRepoOwner,
  apiRepoName,
  apiCommitHash,
  githubAuthToken,
  frontendRepoOwner,
  frontendRepoName,
}) => {
  const generateCmd = getGenerateCmd(typesProjectJson);

  execWrap({
    cmd: `NX_VEGA_URL=${apiUrl} ${generateCmd}`,
    errMessage:
      'There was an error trying to regenerating the types for the frontend.',
  });

  const unstagedFiles = execWrap({
    cmd: `git diff --name-only`,
    errMessage: `Error listing unstaged files`,
  })
    .split('\n')
    .filter((file) => file !== '');

  if (unstagedFiles.length) {
    launchGitWorkflow({ apiVersion, apiCommitHash });
    await launchGithubWorkflow({
      frontendRepoOwner,
      frontendRepoName,
      githubAuthToken,
      issueBody: {
        title: `[automated] Update types for datanode v${apiVersion}`,
        body: `Update the frontend based on the [datanode changes](https://github.com/${apiRepoOwner}/${apiRepoName}/commit/${apiCommitHash}).`,
      },
      prBody: {
        base: 'master',
        title: `fix/${number}: Update types`,
        head: TYPE_UPDATE_BRANCH,
        body: `
  # Related issues 🔗

  Closes #${number}

  # Description ℹ️

  Patches the frontend based on the [datanode changes](https://github.com/${apiRepoOwner}/${apiRepoName}/commit/${apiCommitHash}).

  # Technical 👨‍🔧

  This pull request was automatically generated.
        `,
      },
    });
  }
};

wrapCli(run, cliArgsSpecs);
