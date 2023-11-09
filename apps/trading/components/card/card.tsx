import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLProps, ReactNode } from 'react';

export const Card = ({
  children,
  title,
  className,
  loading = false,
  highlight = false,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
  highlight?: boolean;
}) => {
  return (
    <div
      className={classNames(
        'p-0.5 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        {
          'bg-rainbow': highlight,
        },
        className
      )}
    >
      <div className="p-4 rounded w-full h-full bg-vega-clight-800 dark:bg-vega-cdark-800">
        <h2 className="mb-3">{title}</h2>
        {loading ? <CardLoader /> : children}
      </div>
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-5 bg-vega-clight-600 dark:bg-vega-cdark-600" />
      <div className="w-3/4 h-6 bg-vega-clight-600 dark:bg-vega-cdark-600" />
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
        'text-transparent bg-rainbow bg-clip-text': highlight,
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
        <small className="block mt-0.5 text-xs text-muted">{text}</small>
      )}
    </p>
  );
};

export const CardTable = (props: HTMLProps<HTMLTableElement>) => {
  return (
    <table {...props} className="w-full mt-0.5 text-xs text-muted">
      <tbody>{props.children}</tbody>
    </table>
  );
};

export const CardTableTH = (props: HTMLProps<HTMLTableHeaderCellElement>) => {
  return (
    <th
      {...props}
      className={classNames('font-normal text-left', props.className)}
    />
  );
};

export const CardTableTD = (props: HTMLProps<HTMLTableCellElement>) => {
  return (
    <td {...props} className={classNames('text-right', props.className)} />
  );
};
