import React from 'react';
import { Link } from 'react-router-dom';

import { useAnimateValue } from '../../hooks/use-animate-value';
import type { BigNumber } from '../../lib/bignumber';
import { useNumberParts } from '@vegaprotocol/react-helpers';

interface WalletCardProps {
  children: React.ReactNode;
}

export const WalletCard = ({ children }: WalletCardProps) => {
  return (
    <div className="text-sm border border-neutral-700 p-4 bg-black text-white">
      {children}
    </div>
  );
};

interface WalletCardHeaderProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const WalletCardHeader = ({ children }: WalletCardHeaderProps) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2 mb-2"
      data-testid="wallet-header"
    >
      {children}
    </div>
  );
};

interface WalletCardContentProps {
  children: React.ReactNode;
}

export const WalletCardContent = ({ children }: WalletCardContentProps) => {
  return <div>{children}</div>;
};

export const WalletCardRow = ({
  label,
  link,
  value,
  decimals = 18,
}: {
  label: string;
  link?: string;
  decimals?: number;
  value?: BigNumber | null;
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useAnimateValue(ref, value);
  const [integers, decimalsPlaces, separator] = useNumberParts(value, decimals);

  return (
    <div
      className="flex justify-between gap-y-0 gap-x-2 text-sm mb-2"
      ref={ref}
    >
      {link ? (
        <Link to={link} className="max-w-[200px]">
          {label}
        </Link>
      ) : (
        <span className="max-w-[200px]" data-testid="associated-key">
          {label}
        </span>
      )}
      {value && (
        <span
          className="font-mono flex-1 text-right"
          data-testid="associated-amount"
        >
          <span>
            {integers}
            {separator}
          </span>
          <span>{decimalsPlaces}</span>
        </span>
      )}
    </div>
  );
};

export const WalletCardActions = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="flex justify-end gap-2 mb-4">{children}</div>;
};

export interface WalletCardAssetProps {
  image: string;
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: number;
  border?: boolean;
  subheading?: string;
}

export const WalletCardAsset = ({
  image,
  name,
  symbol,
  balance,
  decimals,
  border,
  subheading,
}: WalletCardAssetProps) => {
  const [integers, decimalsPlaces, separator] = useNumberParts(
    balance,
    decimals
  );

  return (
    <div className="flex flex-nowrap mt-2 mb-4">
      <img
        alt="Vega"
        src={image}
        className={`inline-block w-6 h-6 mt-2 rounded-full border ${
          border ? 'border-white' : 'border-black'
        }`}
      />
      <div>
        <div
          className="flex align-center text-base"
          data-testid="currency-title"
        >
          <div className="mb-0 px-2 uppercase">{name}</div>
          <div className="mb-0 uppercase text-neutral-400">
            {subheading || symbol}
          </div>
        </div>
        <div className="px-2 basis-full font-mono" data-testid="currency-value">
          <span>
            {integers}
            {separator}
          </span>
          <span className="text-neutral-400">{decimalsPlaces}</span>
        </div>
      </div>
    </div>
  );
};
