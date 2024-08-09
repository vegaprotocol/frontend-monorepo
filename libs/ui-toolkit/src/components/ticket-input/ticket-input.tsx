import { cn } from '@vegaprotocol/ui-toolkit';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  appendElement?: ReactNode;
};

export const TicketInput = forwardRef<HTMLInputElement, Props>(
  ({ label, appendElement, ...props }: Props, ref) => {
    return (
      <div
        className="relative flex items-center gap-1 pr-2 h-full w-full focus-within:outline outline-2 outline-vega-blue-550 rounded bg-gs-700 "
        data-testid="ticket-input"
      >
        <input
          ref={ref}
          type="number"
          onWheel={(e) => e.currentTarget.blur()} // prevent mousewheel changing the number
          {...props}
          // Always need a placeholder value present so that the placeholder-shown: class works
          placeholder={props.placeholder || 'hidden'}
          value={props.value}
          onChange={props.onChange}
          className="peer flex-1 w-full appearance-none dark:color-scheme-dark outline-none bg-transparent pt-5 pb-1 px-2 placeholder-transparent"
        />
        {appendElement && appendElement}
        <label
          htmlFor={props.id}
          className={cn(
            'absolute transition-all text-muted transform text-sm left-2 pointer-events-none',
            '-translate-y-2 text-xs top-3',
            'peer-focus:text-xs peer-focus:-translate-y-2',
            'peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
