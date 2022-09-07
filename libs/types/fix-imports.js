const fs = require('fs');
const path = require('path');
const glob = require('glob');
const replace = require('replace-in-file');
const apolloConfig = require('./apollo.config');

replace({
  files: '{apps,libs}/**/__generated__/*.ts',
  from: /"[^"]*\/types\/src\/__generated__\/globalTypes"/g,
  to: '"@vegaprotocol/types"',
});

// @TODO: remove this temporary cleanup ugliness below once all libs and apps are migrated from the old apollo codegen
const MIGRATED_TO_NEW_CODEGEN = apolloConfig.client.excludes.reduce(
  (acc, ignoredPath) => {
    if (
      ignoredPath.startsWith('../../libs/') ||
      ignoredPath.startsWith('../../apps/')
    ) {
      acc.push(path.join(__dirname, ignoredPath.replace('/**', '')));
    }
    return acc;
  },
  []
);

// @TODO: remove also
MIGRATED_TO_NEW_CODEGEN.forEach((packagePath) => {
  glob(path.join(packagePath, '**', '__generated___'), (err, matches) => {
    matches.forEach((match) => {
      console.log(`Handling ${match}...`);
      const oldTypesFolder = match.replace('__generated___', '__generated__');
      if (fs.existsSync(oldTypesFolder)) {
        console.log(`Found ${oldTypesFolder}...`);
        try {
          fs.rmSync(oldTypesFolder, {
            force: true,
            recursive: true,
          });
          console.log(`Removed ${oldTypesFolder}...`);
        } catch (err) {
          console.error(`Error removing ${oldTypesFolder}.`);
        }

        try {
          fs.renameSync(match, oldTypesFolder);
          console.log(`Renamed ${match} to ${oldTypesFolder}...`);
        } catch (err) {
          console.error(`Error renaming ${match} to ${oldTypesFolder}.`);
        }
      }
    });
  });
});
