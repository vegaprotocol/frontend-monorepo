const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  transformIgnorePatterns: [
    ...(nxPreset?.transformIgnorePatterns || []),
    'node_modules/(?!(@vegaprotocol/protos|protobuf-codec))',
  ],
};
