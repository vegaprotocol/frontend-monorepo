const config = require('../../apollo.config');

module.exports = {
  client: {
    ...config.client,
    includes: ['src/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
