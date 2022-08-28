import classNames from 'classnames';
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
    <div className="text-sm border border-white p-4 bg-black text-white">
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
  dark = false,
  decimals = 18,
  bold = false,
}: {
  label: string;
  link?: string;
  decimals?: number;
  value?: BigNumber | null;
  dark?: boolean;
  bold?: boolean;
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useAnimateValue(ref, value);
  const [integers, decimalsPlaces] = useNumberParts(value, decimals);

  return (
    <div
      className={`flex justify-between gap-y-0 gap-x-2 text-sm mb-2 ${
        dark ? 'text-white-60' : 'text-black'
      } ${bold && 'font-bold'}`}
      ref={ref}
    >
      {link ? (
        <Link to={link} className="max-w-[200px]">
          {label}
        </Link>
      ) : (
        <span
          className={`max-w-[200px] ${dark ? 'text-white' : 'text-black'}`}
          data-test-id="associated-key"
        >
          {label}
        </span>
      )}
      {value && (
        <span
          className="font-mono flex-1 text-right"
          data-test-id="associated-amount"
        >
          <span className={dark ? 'text-white' : 'text-black'}>
            {integers}.
          </span>
          <span className={dark ? 'text-white-60' : 'text-black-60'}>
            {decimalsPlaces}
          </span>
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
  dark?: boolean;
  subheading?: string;
}

export const WalletCardAsset = ({
  image,
  name,
  symbol,
  balance,
  decimals,
  border,
  dark,
  subheading,
}: WalletCardAssetProps) => {
  const [integers, decimalsPlaces] = useNumberParts(balance, decimals);

  return (
    <div className="flex flex-nowrap mt-2 mb-4">
      <img
        alt="Vega"
        src={image}
        className={`inline-block h-[30px] rounded-full border ${
          border ? 'border-white' : 'border-black'
        }`}
      />
      <div>
        <div
          className="flex font-medium align-center"
          data-testid="currency-title"
        >
          <h1
            className={`mb-0 px-2 uppercase ${
              dark ? 'text-white' : 'text-black'
            }`}
          >
            {name}
          </h1>
          <h2
            className={`mb-0 uppercase ${
              dark ? 'text-neutral-400' : 'text-neutral-600'
            }`}
          >
            {subheading || symbol}
          </h2>
        </div>
        <div className="px-2 basis-full font-mono" data-testid="currency-value">
          <span>{integers}.</span>
          <span className={dark ? 'text-neutral-400' : 'text-neutral-600'}>
            {decimalsPlaces}
          </span>
        </div>
      </div>
    </div>
  );
};
