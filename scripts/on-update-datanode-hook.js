const path = require('node:path');

const execWrap = require('./utils/exec-wrap');
const githubRequest = require('./utils/github-request');
const wrapCli = require('./utils/wrap-cli');
const launchGitWorkflow = require('./utils/git-workflow');
const launchGithubWorkflow = require('./utils/github-workflow');

const typesProjectJson = require(path.join(
  __dirname,
  '..',
  'libs',
  'types',
  'project.json'
));

const TYPE_UPDATE_BRANCH = 'fix/types';

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
    launchGitWorkflow({
      apiVersion,
      apiCommitHash,
      commitMessage: `update types for v${apiVersion} on HEAD:${apiCommitHash}`,
    });

    await launchGithubWorkflow({
      frontendRepoOwner,
      frontendRepoName,
      githubAuthToken,
      issueBody: {
        title: `[automated] Update types for datanode v${apiVersion}`,
        body: `Update the frontend based on the [datanode changes](https://github.com/${apiRepoOwner}/${apiRepoName}/commit/${apiCommitHash}).`,
      },
      prBody: {
        head: TYPE_UPDATE_BRANCH,
        title: 'Update types',
        body: `Patches the frontend based on the [datanode changes](https://github.com/${apiRepoOwner}/${apiRepoName}/commit/${apiCommitHash}).`,
      }
    });
  }
};

wrapCli(run, cliArgsSpecs);
