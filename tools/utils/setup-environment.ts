import * as fs from 'fs';
import * as path from 'path';
import * as log from 'npmlog';
import * as dotenv from 'dotenv';
import type { ExecutorContext } from '@nrwl/devkit';

process.env['NX_GIT_COMMIT_HASH'] = process.env['COMMIT_REF'] ?? 'dev';
process.env['NX_GIT_BRANCH'] = process.env['BRANCH'] ?? 'dev';
process.env['NX_GIT_ORIGIN_URL'] = process.env['REPOSITORY_URL'] ?? '';

const logEnvData = (
  envMap: Record<string, string>,
  envFiles: string[],
  env?: string,
  defaultEnvFile?: string,
  loggerScope?: string
) => {
  if (env && !envMap[env]) {
    log.warn(loggerScope, `No environment called "${env}" found.`);
    log.info(
      loggerScope,
      envFiles.length > 0
        ? `You can create a new environment by putting an ".env.${env}" file in your project root, or you can use the following available ones: ${envFiles.join(
            ', '
          )}.`
        : 'To get started with environments, you can create an ".env" file in your project root with the desired variables.'
    );
  }

  if (!envMap[env]) {
    log.info(
      loggerScope,
      defaultEnvFile
        ? `Using "${defaultEnvFile}" as the default project environment.`
        : 'Serving the project only using the environment variables scoped to your CLI.'
    );
  } else {
    log.info(
      loggerScope,
      `Using "${envMap[env]}" as the default project environment.`
    );
  }
};

const filenameToEnv = (filename: string) => filename.replace('.env.', '');

const getDefaultEnvFile = (envMap: Record<string, string>) => {
  return envMap['local'] || envMap['.env'];
};

const getEnvFile = (env: string, envFiles: string[], loggerScope?: string) => {
  const envMap = envFiles.reduce(
    (acc, filename) => ({
      ...acc,
      [filenameToEnv(filename)]: filename,
    }),
    {}
  );

  const defaultEnvFile = getDefaultEnvFile(envMap);
  logEnvData(envMap, envFiles, env, defaultEnvFile, loggerScope);

  return envMap[env] || defaultEnvFile;
};

export default async function setup(
  env: string,
  context: ExecutorContext,
  loggerScope?: string
) {
  const { root } = context.workspace.projects[context.projectName];
  const workspacePath = path.join(context.cwd, root);

  const files = await fs.promises.readdir(workspacePath);

  const envFile = getEnvFile(
    env,
    files.filter((f) => f.startsWith('.env')),
    loggerScope
  );

  if (env && envFile) {
    dotenv.config({ path: path.join(workspacePath, envFile), override: true });
  }
}
