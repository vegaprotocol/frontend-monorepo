const fs = require('node:fs');
const path = require('node:path');

const execWrap = require('./utils/exec-wrap');
const githubRequest = require('./utils/github-request');
const wrapCli = require('./utils/wrap-cli');
const launchGitWorkflow = require('./utils/git-workflow');
const launchGithubWorkflow = require('./utils/github-workflow');

const NETWORK_UPDATE_BRANCH = 'fix/networks';
const STATIC_APP_PATH = path.join(__dirname, '..', 'apps', 'static');
const NETWORK_CONFIG_PATH = path.join(STATIC_APP_PATH, 'src', 'assets');

const getJson = (value, errMessage) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    throw new Error(errMessage);
  }
};

const cliArgsSpecs = [
  {
    name: 'payload',
    arg: 'payload',
    required: true,
    validate: (rawPayload) => {
      const payload = getJson(
        rawPayload,
        'The payload must be a valid json object'
      );
      Object.keys(payload).forEach((network) => {
        const item = payload[network] || {};
        console.log(item);
        if (typeof item.chainId !== 'string') {
          throw new Error(
            `The network "${network}" must have a valid chainId.`
          );
        }
        if (!Array.isArray(item.hosts)) {
          throw new Error(
            `The network "${network}" must have a valid list of hosts.`
          );
        }
        item.hosts.forEach((host) => {
          try {
            new URL(host);
          } catch (err) {
            throw new Error(
              `The host "${host}" on the network "${network}" must be a valid url.`
            );
          }
        });
      });
    },
  },
  {
    name: 'networkCommitHash',
    arg: 'commit',
    required: true,
  },
  {
    name: 'networkRepoName',
    arg: 'repo',
    required: true,
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

const getNetworkConfigFileName = (network) =>
  `${network.toLowerCase()}-network.json`;

const findTargetConfig = (network) => {
  const fileName = getNetworkConfigFileName(network);
  return path.join(NETWORK_CONFIG_PATH, fileName);
};

const run = async ({
  payload,
  networkCommitHash,
  networkRepoName,
  networkRepoOwner,
  frontendRepoOwner,
  frontendRepoName,
  githubAuthToken,
}) => {
  const networks = JSON.parse(payload);
  for (let network in networks) {
    const file = findTargetConfig(network);
    if (fs.existsSync(file)) {
      const fd = fs.openSync(file, 'w+');
      fs.writeSync(fd, file, JSON.stringify(networks[network]));
    }
  }

  const unstagedFiles = execWrap({
    cmd: `git diff --name-only`,
    errMessage: `Error listing unstaged files`,
  })
    .split('\n')
    .filter((file) => file !== '');

  console.log(frontendRepoOwner, frontendRepoName);

  if (unstagedFiles.length) {
    launchGitWorkflow({
      branchName: NETWORK_UPDATE_BRANCH,
      frontendRepoOwner,
      frontendRepoName,
      commitMessage: `update networks based on ${networkRepoOwner}/${networkRepoName} HEAD:${networkCommitHash}`,
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
};

wrapCli(run, cliArgsSpecs);
