import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

import { useAnimateValue } from '../../hooks/use-animate-value';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';

const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
) => {
  return React.useMemo(() => {
    if (!value) {
      return ['0', '0'.repeat(decimals)];
    }
    // @ts-ignore confident not undefined
    const separator = BigNumber.config().FORMAT.decimalSeparator as string;
    const [integers, decimalsPlaces] = formatNumber(value, 18)
      .toString()
      .split(separator);
    return [integers, decimalsPlaces];
  }, [decimals, value]);
};

interface WalletCardProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const WalletCard = ({ dark, children }: WalletCardProps) => {
  const className = classNames(
    'text-ui border border-white',
    'pt-4 pl-8 pr-12 pb-12',
    {
      'bg-black text-white': dark,
      'bg-white text-black': !dark,
    }
  );
  return <div className={className}>{children}</div>;
};

interface WalletCardHeaderProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const WalletCardHeader = ({ children }: WalletCardHeaderProps) => {
  return <div className="grid grid-cols-[auto_1fr] gap-4">{children}</div>;
};

interface WalletCardContentProps {
  children: React.ReactNode;
}

export const WalletCardContent = ({ children }: WalletCardContentProps) => {
  return <div className="mt-8">{children}</div>;
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
      className={`flex justify-between gap-y-0 gap-x-4 text-ui my-4 p-2 ${
        dark ? 'text-white-60' : 'text-black'
      } ${bold && 'font-bold'}`}
      ref={ref}
    >
      {link ? (
        <Link to={link} className="max-w-[200px]">
          {label}
        </Link>
      ) : (
        <span className={`max-w-[200px] ${dark ? 'text-white' : 'text-black'}`}>
          {label}
        </span>
      )}
      {value && (
        <span className="font-mono flex-1 text-right">
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
  return <div className="flex justify-end gap-2 py-2">{children}</div>;
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
    <div className="flex flex-nowrap mt-8 mb-16">
      <img
        alt="Vega"
        src={image}
        className={`inline-block h-[30px] rounded-[50%] border ${
          border ? 'border-white' : 'border-black'
        }`}
      />
      <div>
        <div className="flex font-medium align-center">
          <h1
            className={`text-h5 mb-0 px-8 uppercase leading-none ${
              dark ? 'text-white' : 'text-black'
            }`}
          >
            {name}
          </h1>
          <h2
            className={`text-h5 mb-0 uppercase leading-none ${
              dark ? 'text-white-60' : 'text-black-60'
            }`}
          >
            {subheading || symbol}
          </h2>
        </div>
        <div className="px-8 text-h5 basis-full font-mono">
          <span>{integers}.</span>
          <span className={dark ? 'text-white-60' : 'text-black-60'}>
            {decimalsPlaces}
          </span>
        </div>
      </div>
    </div>
  );
};
