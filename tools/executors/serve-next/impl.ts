import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../utils/setup-environment';
import nextServerExecutor from '@nrwl/next/src/executors/server/server.impl';
import { NextServeBuilderOptions } from '@nrwl/next/src/utils/types';

type Schema = NextServeBuilderOptions & {
  env?: string;
};

export default async function* serve(
  options: Schema,
  context: ExecutorContext
): ReturnType<typeof nextServerExecutor> {
  const { env, ...nextOptions } = options;
  setup(env, context, 'tools/executors/serve-next');

  return yield* nextServerExecutor(nextOptions, context);
}
