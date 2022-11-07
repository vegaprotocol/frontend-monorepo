const theme = require('./theme');
const themelite = require('./theme-lite');
const vegaCustomClasses = require('./vega-custom-classes');
const { VegaColours } = require('./vega-colours');

module.exports = {
  theme,
  themelite,
  plugins: [vegaCustomClasses],
  VegaColours,
};
