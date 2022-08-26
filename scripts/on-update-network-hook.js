const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const execWrap = require('./utils/exec-wrap');
const githubRequest = require('./utils/github-request');
const wrapCli = require('./utils/wrap-cli');
const launchGithubWorkflow = require('./utils/github-workflow');

const NETWORK_UPDATE_BRANCH = 'fix/networks';
const staticAppRoot = path.join(__dirname, '..', 'apps', 'static');
const networkConfigPath = path.join(staticAppRoot, 'src', 'assets');

const cliArgsSpecs = [
  {
    name: 'network',
    arg: 'network',
    required: true,
  },
  {
    name: 'hosts',
    arg: 'hosts',
    required: true,
  },
  {
    name: 'networkCommitHash',
    arg: 'commit',
    required: true,
  },
  {
    name: 'networkRepoName',
    arg: 'repo',
    default: 'vega',
  },
  {
    name: 'networkRepoOwner',
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

const getNetworkConfigFileName = (network) => `${network}-config.json`;

const findTargetConfig = (network) => {

}

const run = async ({
  network,
  hosts,
  networkCommitHash,
  networkRepoName,
  networkRepoOwner,
  frontendRepoOwner,
  frontendRepoName,
  githubAuthToken,
}) => {


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
      commitMessage: `update networks for v${apiVersion} on HEAD:${apiCommitHash}`,
    });

    await launchGithubWorkflow({
      frontendRepoOwner,
      frontendRepoName,
      githubAuthToken,
      issueBody: {
        title: `[automated] Update network configuration`,
        body: `Update the frontend based on the [datanode changes](https://github.com/${networkRepoOwner}/${networkRepoName}/commit/${networkCommitHash}).`,
      },
      prBody: {
        head: NETWORK_UPDATE_BRANCH,
        title: 'Update networks',
        body: `Patches the frontend based on the [network changes](https://github.com/${networkRepoOwner}/${networkRepoName}/commit/${networkCommitHash}).`,
      },
    });
  }
}

wrapCli(run, cliArgsSpecs);
