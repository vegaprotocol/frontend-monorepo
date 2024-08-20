import inprocess from './pow/in-process.js';

const solver = (async () => {
  const pow = inprocess();

  return pow;
})();

export default async function solve(args) {
  const pow = await solver;

  return pow(args);
}
