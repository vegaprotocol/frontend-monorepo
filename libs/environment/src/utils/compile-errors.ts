import type { ZodIssue } from 'zod';
import { ZodError } from 'zod';

export const compileErrors = (
  headline: string,
  error: any,
  compileIssue?: (issue: ZodIssue) => string
) => {
  if (error instanceof ZodError) {
    return error.issues.reduce((acc, issue) => {
      return (
        acc + `\n  - ${compileIssue ? compileIssue(issue) : issue.message}`
      );
    }, `${headline}:`);
  }

  return `${headline}${error?.message ? `: ${error.message}` : ''}`;
};
