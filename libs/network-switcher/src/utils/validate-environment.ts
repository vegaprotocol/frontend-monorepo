import type { Environment, EnvKey } from '../types';

export const validateEnvironment = (
  environment: Environment
): string | undefined => {
  const missingKeys = Object.keys(environment)
    .filter((key) => typeof environment[key as EnvKey] === undefined)
    .map((key) => `"${key}"`)
    .join(', ');

  if (missingKeys.length) {
    return `Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}.`;
  }

  return undefined;
};
