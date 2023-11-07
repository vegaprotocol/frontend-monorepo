import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export const Card = ({
  children,
  title,
  className,
  loading = false,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  loading?: boolean;
}) => {
  return (
    <div
      className={classNames(
        'p-4 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        className,
      )}
    >
      <h2 className="mb-9">{title}</h2>
      {loading ? <CardLoader /> : children}
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
}: {
  value: ReactNode;
  text?: string;
  highlight?: boolean;
  description?: ReactNode;
}) => {
  const val = (
    <span
      className={classNames('inline-block text-3xl leading-none', {
        'text-transparent bg-rainbow bg-clip-text': highlight,
        'cursor-help': description,
      })}
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

export const CardTable = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full mt-0.5 text-xs text-muted">
      <tbody>{children}</tbody>
    </table>
  );
};

export const CardTableTH = ({ children }: { children: ReactNode }) => {
  return <th className="font-normal text-left">{children}</th>;
};

export const CardTableTD = ({ children }: { children: ReactNode }) => {
  return <td className="text-right">{children}</td>;
};
