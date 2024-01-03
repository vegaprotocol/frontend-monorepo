import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLProps, ReactNode } from 'react';

export const Card = ({
  children,
  title,
  className,
  loading = false,
  highlight = false,
  testId,
  noBackgroundOnMobile = false,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
  highlight?: boolean;
  testId?: string;
  noBackgroundOnMobile?: boolean;
}) => {
  return (
    <div
      data-testid={testId}
      className={classNames(
        'col-span-full lg:col-auto',
        {
          'rounded-lg bg-vega-clight-800 dark:bg-vega-cdark-800 p-0.5':
            !noBackgroundOnMobile,
          'mt-3 md:mt-0 md:rounded-lg md:bg-vega-clight-800 md:dark:bg-vega-cdark-800 md:p-0.5':
            noBackgroundOnMobile,
        },
        {
          'bg-rainbow': highlight,
        },
        className
      )}
    >
      <div
        className={classNames('h-full w-full', {
          'bg-vega-clight-800 dark:bg-vega-cdark-800 rounded p-4':
            !noBackgroundOnMobile,
          'md:bg-vega-clight-800 md:dark:bg-vega-cdark-800 md:rounded md:p-4':
            noBackgroundOnMobile,
        })}
      >
        <h2 className="mb-3">{title}</h2>
        {loading ? <CardLoader /> : children}
      </div>
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-vega-clight-600 dark:bg-vega-cdark-600 h-5 w-full" />
      <div className="bg-vega-clight-600 dark:bg-vega-cdark-600 h-6 w-3/4" />
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
