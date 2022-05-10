const { readFileSync, writeFileSync } = require('fs');
const glob = require('glob');
const recast = require('recast');
const tsParser = require('recast/parsers/typescript');
const util = require('util');

const queries = [];

const globPromise = util.promisify(glob);

const processFiles = (files) => {
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
  writeFileSync('./queries.graphql', queries.join('\n'), {
    encoding: 'utf-8',
  });
};

const run = async () => {
  const files1 = await globPromise('apps/**/*.ts');
  const files2 = await globPromise('libs/**/*.ts');
  processFiles([...files1, ...files2]);
};

run();
