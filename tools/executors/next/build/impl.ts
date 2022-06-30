import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../../utils/setup-environment';
import nextBuildExecutor from '@nrwl/next/src/executors/build/build.impl';
import { NextBuildBuilderOptions } from '@nrwl/next/src/utils/types';

type Schema = NextBuildBuilderOptions & {
  env?: string;
};

export default async function build(
  options: Schema,
  context: ExecutorContext
): Promise<ReturnType<typeof nextBuildExecutor>> {
  const { env, ...nextOptions } = options;
  await setup(env, context, 'tools/executors/next/build');

  return nextBuildExecutor(nextOptions, context);
}
