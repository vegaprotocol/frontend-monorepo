module.exports = ({
  commitMessage,
  frontendRepoOwner,
  frontendRepoName,
}) => {
  const remoteBranches = execWrap({
    cmd: `git ls-remote --heads ssh://github.com/${frontendRepoOwner}/${frontendRepoName}.git ${TYPE_UPDATE_BRANCH}`,
    errMessage: `Error checking if the branch "${TYPE_UPDATE_BRANCH}" exists on the origin.`,
  });
  const localBranches = execWrap({
    cmd: 'git branch',
    errMessage: `Error getting local branch names.`,
  });

  if (
    remoteBranches.includes(TYPE_UPDATE_BRANCH) ||
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
    cmd: `git commit -m 'chore: ${commitMessage}' --no-verify`,
    errMessage: `Error checking if the branch "${TYPE_UPDATE_BRANCH}" exists on the origin.`,
  });

  execWrap({
    cmd: `git push -u ssh://github.com/${frontendRepoOwner}/${frontendRepoName}.git ${TYPE_UPDATE_BRANCH} --no-verify`,
    errMessage: 'Error pushing changes.',
  });
};
