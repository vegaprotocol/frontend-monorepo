import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../../utils/setup-environment';
import devServerExecutor, {
  WebDevServerOptions,
} from '@nrwl/web/src/executors/dev-server/dev-server.impl';

type Schema = WebDevServerOptions & {
  env?: string;
};

export default async function* serve(
  options: Schema,
  context: ExecutorContext
): ReturnType<typeof devServerExecutor> {
  const { env, ...serverOptions } = options;
  await setup(env, context, 'tools/executors/webpack/serve');

  return yield* devServerExecutor(serverOptions, context);
}
