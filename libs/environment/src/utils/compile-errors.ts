import type { ZodIssue } from 'zod';
import { ZodError } from 'zod';

export const compileErrors = (
  headline: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
) => {
  if (error instanceof ZodError) {
    return error.issues.reduce((acc, issue) => {
      return acc + `\n  - ${compileIssue(issue)}`;
    }, headline);
  }

  return `${headline}${error?.message ? `: ${error.message}` : ''}`;
};

const compileIssue = (issue: ZodIssue) => {
  switch (issue.code) {
    case 'invalid_type':
      return `NX_${issue.path[0]}: Received "${issue.received}" instead of: ${issue.expected}`;
    case 'invalid_enum_value':
      return `NX_${issue.path[0]}: Received "${
        issue.received
      }" instead of: ${issue.options.join(' | ')}`;
    default:
      return `NX_${issue.path.join('.')}: ${issue.message}`;
  }
};
