import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../utils/setup-environment';
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
  const { env, ...dsOptions } = options;
  setup(env, context, 'tools/executors/serve');

  return yield* devServerExecutor(dsOptions, context);
}
