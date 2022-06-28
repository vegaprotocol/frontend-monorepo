import classNames from 'classnames';
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
    const classes = classNames(defaultFormElement(hasError), className);
    return <textarea {...props} ref={ref} className={classes} />;
  }
);
