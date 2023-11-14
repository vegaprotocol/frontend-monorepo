const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    // this mapping fixes jest breaking if anything tries to import d3 due to esm exports
    '^d3-(.*)$': 'd3-$1/dist/d3-$1',
  },
};
