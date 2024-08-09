import { cn } from '../../utils/cn';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { defaultFormElement } from '../../utils/shared';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, hasError, ...props }, ref) => {
    const textAreaClassName = cn(
      'shadow-input dark:shadow-input-dark !overflow-auto',
      className
    );

    const classes = cn(defaultFormElement(hasError), textAreaClassName);
    return <textarea {...props} ref={ref} className={classes} />;
  }
);
