const githubRequest = require('./github-request');

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
      body: JSON.stringify(issueBody),
    }
  );

  console.log(`Issue created: ${issueHtmlUrl}`);

  const { html_url: prHtmlUrl } = await githubRequest(
    `https://api.github.com/repos/${frontendRepoOwner}/${frontendRepoName}/pulls`,
    {
      body: JSON.stringify({
        base: prBody.base || 'master',
        title: `fix/${number}: ${prBody.title}`,
        head: prBody.head,
        body: `
  # Related issues 🔗

  Closes #${number}

  # Description ℹ️

  ${prBody.body}

  # Technical 👨‍🔧

  This pull request was automatically generated.
      `,
      }),
    }
  );

  console.log(`Pull request created: ${prHtmlUrl}`);
};
