const theme = require('./theme');
const vegaCustomClasses = require('./vega-custom-classes');

module.exports = {
  theme,
  plugins: [vegaCustomClasses],
};
