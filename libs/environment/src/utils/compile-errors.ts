import type { ZodIssue, ZodError } from 'zod';

export const compileErrors = (headline: string, error: ZodError) => {
  return error.issues.reduce((acc, issue) => {
    return acc + `\n  - ${compileIssue(issue)}`;
  }, headline);
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
