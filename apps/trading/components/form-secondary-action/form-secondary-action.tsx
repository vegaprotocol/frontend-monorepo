import { type ButtonHTMLAttributes, type HTMLAttributes } from 'react';

export const FormSecondaryActionWrapper = (
  props: HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div {...props} className="absolute right-0 top-0 pt-0.5 flex gap-2" />
  );
};

export const FormSecondaryActionButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      type="button"
      className="text-xs underline underline-offset-4"
    />
  );
};
