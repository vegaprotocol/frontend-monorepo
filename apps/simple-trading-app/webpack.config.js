module.exports = (config, context) => ({
  ...config,
  node: {
    ...config.node,
    __dirname: true,
  },
});
