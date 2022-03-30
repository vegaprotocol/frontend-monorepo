import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { inputClassNames } from '../input/input';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => (
    <textarea {...props} ref={ref} className={inputClassNames(props)} />
  )
);
