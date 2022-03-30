const config = require('../../apollo.config');

module.exports = {
  client: {
    ...config.client,
    includes: ['./{pages,lib,hooks,components}/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
