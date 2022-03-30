const config = require('../../apollo.config');

module.exports = {
  client: {
    ...config.client,
    includes: ['src/**/*.*'],
  },
};
