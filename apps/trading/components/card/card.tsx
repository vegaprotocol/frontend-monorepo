import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLProps, ReactNode } from 'react';

export const Card = ({
  children,
  title,
  className,
  loading = false,
  testId,
  variant = 'normal',
  size = 'md',
  minimal = false,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  loading?: boolean;
  testId?: string;
  variant?: 'normal' | 'hot' | 'cool';
  size?: 'md' | 'lg';
  minimal?: boolean;
}) => {
  return (
    <div
      data-testid={testId}
      className={classNames(
        'relative col-span-full lg:col-auto',
        'rounded-lg',
        {
          'p-4': size === 'md',
          'p-7': size === 'lg',
          'bg-gs-800 ': !minimal,
        },
        className
      )}
    >
      {variant !== 'normal' && (
        <div
          style={{
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
          className={classNames(
            'absolute inset-0 p-px bg-gradient-to-br rounded-lg pointer-events-none',
            {
              'from-vega-blue to-vega-green': variant === 'cool',
              'from-vega-pink to-vega-blue': variant == 'hot',
            }
          )}
        />
      )}
      {title && <h2 className="mb-3">{title}</h2>}
      {loading ? <CardLoader /> : children}
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gs-600  h-5 w-full" />
      <div className="bg-gs-600  h-6 w-3/4" />
    </div>
  );
};

export const CardStat = ({
  value,
  text,
  highlight,
  description,
  testId,
}: {
  value: ReactNode;
  text?: string;
  highlight?: boolean;
  description?: ReactNode;
  testId?: string;
}) => {
  const val = (
    <span
      className={classNames('inline-block text-3xl leading-none', {
        'bg-rainbow bg-clip-text text-transparent': highlight,
        'cursor-help': description,
      })}
      data-testid={testId}
    >
      {value}
    </span>
  );

  return (
    <p className="leading-none">
      {description ? <Tooltip description={description}>{val}</Tooltip> : val}
      {text && (
        <small className="text-muted mt-0.5 block text-xs">{text}</small>
      )}
    </p>
  );
};

export const CardTable = (props: HTMLProps<HTMLTableElement>) => {
  return (
    <table {...props} className="text-muted mt-0.5 w-full text-xs">
      <tbody>{props.children}</tbody>
    </table>
  );
};

export const CardTableTH = (props: HTMLProps<HTMLTableHeaderCellElement>) => {
  return (
    <th
      {...props}
      className={classNames('text-left font-normal', props.className)}
    />
  );
};

export const CardTableTD = (props: HTMLProps<HTMLTableCellElement>) => {
  return (
    <td {...props} className={classNames('text-right', props.className)} />
  );
};
