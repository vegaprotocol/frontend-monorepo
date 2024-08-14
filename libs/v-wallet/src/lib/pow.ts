import inprocess from './pow/in-process';

const solver = (async () => {
  const pow = inprocess();

  return pow;
})();

export default async function solve(args: {
  difficulty: number;
  blockHash: string;
  tid: string;
}) {
  const pow = await solver;

  return pow(args);
}
