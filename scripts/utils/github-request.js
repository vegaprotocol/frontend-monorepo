const request = require('./request');

module.exports = async (url, { body }) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${githubAuthToken}`,
      'User-Agent': '',
    },
  };
  options.agent = new https.Agent(options);

  return request(
    url,
    {
      ...options,
      body,
    }
  );

}
