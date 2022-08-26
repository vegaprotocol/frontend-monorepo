module.exports = async ({
  issueBody,
  prBody,
  frontendRepoOwner,
  frontendRepoName,
  githubAuthToken,
}) => {
  const { number, html_url: issueHtmlUrl } = await githubRequest(
    `https://api.github.com/repos/${frontendRepoOwner}/${frontendRepoName}/issues`,
    {
      body: JSON.stringify({
        title: `[automated] Update types for datanode v${apiVersion}`,
        body: `Update the frontend based on the [datanode changes](https://github.com/${apiRepoOwner}/${apiRepoName}/commit/${apiCommitHash}).`,
      }),
    }
  );

  console.log(`Issue created: ${issueHtmlUrl}`);

  const { html_url: prHtmlUrl } = await githubRequest(
    `https://api.github.com/repos/${frontendRepoOwner}/${frontendRepoName}/pulls`,
    {
      body: JSON.stringify({
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
      }),
    }
  );

  console.log(`Pull request created: ${prHtmlUrl}`);
};
