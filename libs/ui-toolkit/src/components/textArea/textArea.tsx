import { TextareaHTMLAttributes, forwardRef } from 'react';
import { inputClassNames } from '../input/input';

/* eslint-disable-next-line */
export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => <textarea {...props} className={inputClassNames(props)} />
);
