const execWrap = require('./exec-wrap');

module.exports = ({
  branchName,
  commitMessage,
  frontendRepoOwner,
  frontendRepoName,
}) => {
  const remoteBranches = execWrap({
    cmd: `git ls-remote --heads ssh://github.com/${frontendRepoOwner}/${frontendRepoName}.git ${branchName}`,
    errMessage: `Error checking if the branch "${branchName}" exists on the origin.`,
  });
  const localBranches = execWrap({
    cmd: 'git branch',
    errMessage: `Error getting local branch names.`,
  });

  if (
    remoteBranches.includes(branchName) ||
    localBranches.includes(branchName)
  ) {
    const currentBranchName = execWrap({
      cmd: `git branch --show-current`,
      errMessage: `Error getting current branch name.`,
    });

    if (currentBranchName !== branchName) {
      execWrap({
        cmd: `git checkout ${branchName}`,
        errMessage: `There was an error trying to check out the branch "${branchName}".`,
      });
    }
  } else {
    execWrap({
      cmd: `git checkout -b ${branchName}`,
      errMessage: `There was an error trying to check out the branch "${branchName}".`,
    });
  }

  execWrap({
    cmd: `git add .`,
    errMessage: `Error staging changed files.`,
  });

  execWrap({
    cmd: `git commit -m 'chore: ${commitMessage}' --no-verify`,
    errMessage: `Error checking if the branch "${branchName}" exists on the origin.`,
  });

  execWrap({
    cmd: `git push -u ssh://github.com/${frontendRepoOwner}/${frontendRepoName}.git ${branchName} --no-verify`,
    errMessage: 'Error pushing changes.',
  });
};
