import inprocess from './pow/in-process.js';
// import chromium from './pow/chromium.js';
import webworker from './pow/web-worker.js';

const solver = (async () => {
  const pow = (await webworker()) || inprocess();

  return pow;
})();

export default async function solve(args) {
  const pow = await solver;

  return pow(args);
}
