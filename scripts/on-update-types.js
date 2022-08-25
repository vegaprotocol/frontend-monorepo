const path = require('node:path');
const https = require('node:https');
const { execSync } = require('node:child_process');

const typesProjectJson = require(path.join(
  __dirname,
  '..',
  'libs',
  'types',
  'project.json'
));

const GITHUB_OWNER = 'vegaprotocol';
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
    name: 'githubAuthToken',
    arg: 'token',
    required: true,
  },
];

const request = (url, options) => new Promise((resolve, reject) => {
  const req = https.request(url, options, res => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {
      rawData += chunk.toString();
    });
    res.on('error', (err) => {
      reject(err)
    })
    res.on('end', () => {
      if (res.statusCode >= 400) {
        reject(new Error(`HTTPS ${res.statusCode}: ${rawData}`))
        return;
      }
      try {
        const parsedData = JSON.parse(rawData);
        console.log(parsedData)
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    })
  })

  if (options.method === 'POST' && options.body) {
    req.write(options.body)
  }

  req.on('error', (err) => {
    reject(err)
  })

  req.end()
})

const getConfig = ({ specs, args = [] }) => {
  const defaultConfig = {
    apiUrl: undefined,
    apiVersion: undefined,
  };

  return specs.reduce((acc, spec) => {
    const match = args.find((arg) => arg.startsWith(`--${spec.arg}=`));
    const value = (match || '').replace(`--${spec.arg}=`, '');

    if (spec.required && !value) {
      throw new Error(`Cannot find required CLI argument "--${spec.arg}".`);
    }
    if (typeof spec.validate === 'function') {
      spec.validate(value);
    }
    return {
      ...acc,
      [spec.name]: value,
    };
  }, {});
};

const execWrap = ({ cmd, errMessage }) => {
  console.log(`executing: "${cmd}"`);
  try {
    const result = execSync(cmd, { cwd: appRoot, stdout: process.stdout });
    return result.toString();
  } catch (err) {
    throw new Error(errMessage);
  }
};

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

const launchGitWorkflow = ({ apiVersion, apiCommitHash }) => {
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
    cmd: `git push -u origin ${TYPE_UPDATE_BRANCH} --no-verify`,
    errMessage: 'Error pushing changes.',
  });
};

const launchGithubWorkflow = async ({
  apiRepoName,
  apiVersion,
  apiCommitHash,
  githubAuthToken,
}) => {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${githubAuthToken}`,
      'User-Agent': '',
    },
  }
  options.agent = new https.Agent(options)

  const { number } = await request(`https://api.github.com/repos/${GITHUB_OWNER}/${apiRepoName}/issues`, {
    ...options,
    body: JSON.stringify({
      title: `Update types for datanode v${apiVersion}`,
      body: `Update the frontend based on the [datanode changes](https://github.com/${GITHUB_OWNER}/${apiRepoName}/commit/${apiCommitHash}).`,
    }),
  })

  await request(`https://api.github.com/repos/${GITHUB_OWNER}/${apiRepoName}/pulls`, {
    ...options,
    body: JSON.stringify({
      base: TYPE_UPDATE_BRANCH,
      title: `fix/${number}: Update types`,
      body: `
  # Related issues 🔗

  Closes #${number}

  # Description ℹ️

  Patches the frontend based on the [datanode changes](https://github.com/${GITHUB_OWNER}/${apiRepoName}/commit/${apiCommitHash}).

  # Technical 👨‍🔧

  This pull request was automatically generated.
      `,
    }),
  })
};

const run = async ({
  apiUrl,
  apiVersion,
  apiRepoName,
  apiCommitHash,
  githubAuthToken,
}) => {
  const generateCmd = getGenerateCmd(typesProjectJson);

  // execWrap({
  //   cmd: `NX_VEGA_URL=${apiUrl} ${generateCmd}`,
  //   errMessage: 'There was an error trying to regenerating the types for the frontend.',
  // })

  const unstagedFiles = execWrap({
    cmd: `git diff --name-only`,
    errMessage: `Error listing unstaged files`,
  })
    .split('\n')
    .filter((file) => file !== '');

  if (unstagedFiles.length) {
    launchGitWorkflow({ apiVersion, apiCommitHash });
    await launchGithubWorkflow({
      apiRepoName,
      apiVersion,
      apiCommitHash,
      githubAuthToken,
    });
  }
};

async function main() {
  try {
    const config = getConfig({
      specs: cliArgsSpecs,
      args: process.argv,
    });
    await run(config);
  } catch (err) {
    console.error(err);
  }
}

main();
