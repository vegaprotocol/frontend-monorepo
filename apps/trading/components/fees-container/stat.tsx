import { Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';

export const Stat = ({
  value,
  text,
  highlight,
  description,
}: {
  value: string | number;
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
    <p className="pt-3 leading-none first:pt-6">
      {description ? <Tooltip description={description}>{val}</Tooltip> : val}
      {text && (
        <small className="block mt-0.5 text-xs text-muted">{text}</small>
      )}
    </p>
  );
};
