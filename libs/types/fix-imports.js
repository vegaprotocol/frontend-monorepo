const replace = require('replace-in-file');
replace({
  files: '{apps,libs}/**/__generated__/*.ts',
  from: /"[^"]*\/types\/src\/__generated__\/globalTypes"/g,
  to: '"@vegaprotocol/types"',
});
