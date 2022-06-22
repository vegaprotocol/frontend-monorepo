const theme = require('./theme');
const themelite = require('./theme-lite');
const vegaCustomClasses = require('./vega-custom-classes');

module.exports = {
  theme,
  themelite,
  plugins: [vegaCustomClasses],
};
