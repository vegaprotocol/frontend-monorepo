import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { type ReactNode } from 'react';

export const TokenOption = (props: {
  name: string;
  symbol: string;
  address: string;
  logoURI?: string;
  balance?: ReactNode;
}) => {
  const t = useT();
  return (
    <div className="w-full flex items-center gap-2 h-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={t('Logo for {{name}}', {
          name: props.name,
        })}
        src={props.logoURI}
        width="30"
        height="30"
        className="rounded-full bg-surface-1 border-surface-1 border-2"
      />
      <div className="text-sm text-left leading-4">
        <div>
          {props.name !== props.symbol ? props.symbol : ''} {props.symbol}
        </div>
        <div className="text-secondary text-xs">
          {truncateMiddle(props.address)}
        </div>
      </div>
      <div className="ml-auto text-sm">{props.balance}</div>
    </div>
  );
};
