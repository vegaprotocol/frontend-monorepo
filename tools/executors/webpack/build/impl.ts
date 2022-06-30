import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../../utils/setup-environment';
import webpackBuildExecutor, {
  WebWebpackExecutorOptions,
} from '@nrwl/web/src/executors/webpack/webpack.impl';

type Schema = WebWebpackExecutorOptions & {
  env?: string;
};

export default async function* build(
  options: Schema,
  context: ExecutorContext
): ReturnType<typeof webpackBuildExecutor> {
  const { env, ...buildOptions } = options;
  await setup(env, context, 'tools/executors/webpack/build');

  return yield* webpackBuildExecutor(buildOptions, context);
}
