const { getJestProjects } = require('@nrwl/jest');

export default {
  projects: getJestProjects(),
  testTimeout: 10000,
};
