const webpack = require('webpack');

module.exports = (config, context) => {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new webpack.DefinePlugin({
        'process.platform': JSON.stringify(process.platform),
      }),
    ],
  };
};
