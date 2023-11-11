const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    '^d3-(.*)$': 'd3-$1/dist/d3-$1',
  },
};
