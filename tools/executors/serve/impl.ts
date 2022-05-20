import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as log from 'npmlog';
import type { ExecutorContext } from '@nrwl/devkit';
import devServerExecutor, {
  WebDevServerOptions,
} from '@nrwl/web/src/executors/dev-server/dev-server.impl';

type Schema = WebDevServerOptions & {
  env?: string;
};

const LOGGER_SCOPE = 'tools/executors/serve';

const filenameToEnv = (filename: string) => filename.replace('.env.', '');

const getDefaultEnvFile = (envMap: Record<string, string>) => {
  return envMap['local'] || envMap['.env'];
};

const getEnvFile = (env: string, envFiles: string[]) => {
  const envMap = envFiles.reduce(
    (acc, filename) => ({
      ...acc,
      [filenameToEnv(filename)]: filename,
    }),
    {}
  );

  const defaultEnvFile = getDefaultEnvFile(envMap);

  if (env && !envMap[env]) {
    log.warn(LOGGER_SCOPE, `No environment called "${env}" found.`);
    log.info(
      LOGGER_SCOPE,
      envFiles.length > 0
        ? `You can create a new environment by putting an ".env.${env}" file in your project root, or you can use the following available ones: ${envFiles.join(
            ', '
          )}.`
        : 'To get started with environments, you can create an ".env" file in your project root with the desired variables.'
    );
  }

  if (!envMap[env]) {
    log.info(
      LOGGER_SCOPE,
      defaultEnvFile
        ? `Using "${defaultEnvFile}" as the default project environment.`
        : 'Serving the project only using the environment variables scoped to your CLI.'
    );
  } else {
    log.info(
      LOGGER_SCOPE,
      `Using "${envMap[env]}" as the default project environment.`,
    );
  }

  return envMap[env] || defaultEnvFile;
};

export default async function* serve(
  options: Schema,
  context: ExecutorContext
): ReturnType<typeof devServerExecutor> {
  const { env, ...dsOptions } = options;
  const { root } = context.workspace.projects[context.projectName];
  const workspacePath = path.join(context.cwd, root);

  const files = await fs.promises.readdir(workspacePath);
  const envFile = getEnvFile(
    env,
    files.filter((f) => f.startsWith('.env'))
  );

  if (envFile) {
    dotenv.config({ path: path.join(workspacePath, envFile), override: true });
  }

  return yield* devServerExecutor(dsOptions, context);
}
