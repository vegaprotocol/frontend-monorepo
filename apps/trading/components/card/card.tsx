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
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
  highlight?: boolean;
  testId?: string;
}) => {
  return (
    <div
      data-testid={testId}
      className={classNames(
        'bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full p-0.5 lg:col-auto',
        'rounded-lg',
        {
          'bg-rainbow': highlight,
        },
        className
      )}
    >
      <div className="bg-vega-clight-800 dark:bg-vega-cdark-800 h-full w-full rounded p-4">
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

interface CardTableTHProps extends HTMLProps<HTMLTableHeaderCellElement> {
  testId?: string;
}

export const CardTableTH = ({ testId, ...props }: CardTableTHProps) => {
  return (
    <th
      {...props}
      className={classNames('text-left font-normal', props.className)}
      data-testid={testId}
    />
  );
};

export const CardTableTD = (props: HTMLProps<HTMLTableCellElement>) => {
  return (
    <td {...props} className={classNames('text-right', props.className)} />
  );
};
