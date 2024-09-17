const fs = require('fs');
const path = require('path');

const NEW_APP_NAME_LOWERCASE = process.argv[2]?.toLowerCase();
const NEW_APP_SYMBOL_LOWERCASE = process.argv[3]?.toLowerCase();

if (!NEW_APP_NAME_LOWERCASE) {
  throw new Error(
    'Please pass in your app name e.g. run the command like node ./libs/i18n/src/locales/en/script.js my_app_name my_app_symbol'
  );
}

// Replace all instances of the word "vega" with the new app name in the translation files
const files = fs.readdirSync(__dirname);
const jsonFiles = files.filter((f) => f.endsWith('.json'));
for (const file of jsonFiles) {
  const filePath = path.resolve(__dirname, file);
  const data = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });
  const json = JSON.parse(data);
  const newObject = Object.fromEntries(
    Object.entries(json).map(([k, v]) => [
      k,
      v
        .replace(/vega/g, NEW_APP_NAME_LOWERCASE)
        .replace(
          /Vega/g,
          NEW_APP_NAME_LOWERCASE.charAt(0).toUpperCase() +
            NEW_APP_NAME_LOWERCASE.slice(1)
        )
        .replace(/VEGA/g, NEW_APP_SYMBOL_LOWERCASE.toUpperCase())
        .replace(/\$VEGA/g, `$${NEW_APP_SYMBOL_LOWERCASE.toLocaleUpperCase()}`),
    ])
  );
  fs.writeFileSync(filePath, JSON.stringify(newObject, null, 2), {
    encoding: 'UTF-8',
  });
}

const otherFiles = [
  'apps/explorer/src/assets/manifest.json',
  'apps/explorer/src/index.html',
  'apps/governance/src/assets/manifest.json',
  'apps/governance/src/index.html',
  'apps/static/src/index.html',
  'apps/trading/public/manifest.json',
  'libs/utils/src/lib/format/strings.ts',
];

// Replace all instances of the word "vega" with the new app name in static assets such as manifests and index.html
for (const file of otherFiles) {
  const filePath = path.resolve(__dirname, '../../../../../', file);
  const data = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });
  const newData = data.replace(
    /APP_NAME/g,
    NEW_APP_NAME_LOWERCASE.charAt(0).toUpperCase() +
      NEW_APP_NAME_LOWERCASE.slice(1)
  );
  fs.writeFileSync(filePath, newData, { encoding: 'utf-8' });
}
