import classNames from 'classnames';
import { type InputHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  appendElement?: ReactNode;
  placeholder: ReactNode;
};

export const TicketInput = ({
  placeholder,
  appendElement,
  ...props
}: Props) => {
  const hasValue =
    props.value !== undefined &&
    props.value !== null &&
    String(props.value) !== '';
  return (
    <div className="group relative">
      <label
        htmlFor={props.name}
        className={classNames(
          'block absolute left-2 text-muted transition-all pointer-events-none',
          'top-1/2 -translate-y-1/2 text-sm',
          {
            'top-3 text-xs': hasValue,
            'group-focus-within:top-3 group-focus-within:text-xs': !hasValue,
          }
        )}
      >
        {placeholder}
      </label>
      <div className="flex items-center gap-1 pr-2 h-full w-full focus-within:outline outline-2 outline-vega-blue-550 rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
        <input
          {...props}
          className="flex-1 appearance-none dark:color-scheme-dark outline-none bg-transparent pt-5 pb-1 px-2 placeholder-transparent"
        />
        {appendElement && appendElement}
      </div>
    </div>
  );
};
