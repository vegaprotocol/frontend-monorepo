import classNames from 'classnames';
import { type InputHTMLAttributes, type ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  appendElement: ReactNode;
};

export const TicketInput = ({
  placeholder,
  appendElement,
  ...props
}: Props) => {
  return (
    <div className="group relative">
      <label
        htmlFor={props.name}
        className={classNames(
          'block absolute left-2 text-muted transition-all pointer-events-none',
          'top-1/2 -translate-y-1/2 text-sm',
          'group-focus-within:top-2 group-focus-within:text-xs',
          'group-placeholder-shown:top-2 group-placeholder-shown:text-xs'
        )}
      >
        {placeholder}
      </label>
      <div className="flex items-center gap-1 pr-2 h-full w-full focus-within:outline outline-2 outline-vega-blue-550 rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
        <input
          {...props}
          placeholder={placeholder}
          className="flex-1 appearance-none dark:color-scheme-dark outline-none bg-transparent pt-4 pb-2 px-2 placeholder-transparent"
        />
        {appendElement && appendElement}
      </div>
    </div>
  );
};
