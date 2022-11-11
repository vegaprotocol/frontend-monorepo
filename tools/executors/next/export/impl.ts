import type { ExecutorContext } from '@nrwl/devkit';
import setup from '../../../utils/setup-environment';
import nextExportExecutor from '@nrwl/next/src/executors/export/export.impl';
import { NextExportBuilderOptions } from '@nrwl/next/src/utils/types';

type Schema = NextExportBuilderOptions & {
  env: string;
};

export default async function exportWithEnv(
  options: Schema,
  context: ExecutorContext
) {
  const { env, ...nextOptions } = options;
  await setup(env, context, 'tools/executors/next/export');

  try {
    return await nextExportExecutor(nextOptions, context);
  } catch (err) {
    console.error(err);
  }
}
