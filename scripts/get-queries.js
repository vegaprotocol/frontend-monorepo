const { readFileSync, writeFileSync } = require('fs');
const glob = require('glob');
const recast = require('recast');
const tsParser = require('recast/parsers/babel-ts');
const util = require('util');

const queries = [];
const ignore = [
  'libs/fills/src/lib/fills-data-provider.ts',
  'libs/orders/src/lib/components/order-data-provider/order-data-provider.ts',
  'libs/trades/src/lib/trades-data-provider.ts',
  // any queries in libs/cypress run against capsule
  'libs/cypress/**/*.ts',
  'libs/cypress/**/*.js',
];

const globPromise = util.promisify(glob);
const globOptions = { ignore };

const processTsFiles = (files) => {
  for (const file of files) {
    const textContent = readFileSync(file, { encoding: 'utf-8' });
    const ast = recast.parse(textContent, { parser: tsParser });
    recast.visit(ast, {
      visitTaggedTemplateExpression(path) {
        const newQuasi = { ...path.value.quasi, expressions: [] };
        if (path.value.tag.name === 'gql') {
          queries.push(`# File: ${file}
# Query:
${recast.print(newQuasi).code.replace(/`/g, '')}`);
        }
        return false;
      },
    });
  }
};

const processGraphQlFiles = (files) => {
  for (const file of files) {
    const textContent = readFileSync(file, { encoding: 'utf-8' });
    const data = `
# File: ${file}

${textContent}
    `;
    queries.push(data);
  }
};

const run = async () => {
  const files1 = await globPromise('apps/**/*.ts', globOptions);
  const files2 = await globPromise('libs/**/*.ts', globOptions);
  const files3 = await globPromise('apps/**/*.tsx', globOptions);
  const files4 = await globPromise('lib/**/*.tsx', globOptions);
  processTsFiles([...files1, ...files2, ...files3, ...files4]);
  const gqlFiles1 = await globPromise('lib/**/*.graphql');
  const gqlFiles2 = await globPromise('apps/**/*.graphql');
  processGraphQlFiles([...gqlFiles1, ...gqlFiles2]);
  writeFileSync('./queries.graphql', queries.join('\n'), {
    encoding: 'utf-8',
  });
};

run();
