import "./wallet-card.scss";

import React from "react";
import { Link } from "react-router-dom";

import { useAnimateValue } from "../../hooks/use-animate-value";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";

const useNumberParts = (
  value: BigNumber | null | undefined,
  decimals: number
) => {
  return React.useMemo(() => {
    if (!value) {
      return ["0", "0".repeat(decimals)];
    }
    // @ts-ignore
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

export const WalletCard = ({ dark, children }: WalletCardProps) => (
  <div className={`wallet-card ${dark ? "wallet-card--inverted" : ""}`}>
    {children}
  </div>
);

interface WalletCardHeaderProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const WalletCardHeader = ({ children, dark }: WalletCardHeaderProps) => {
  return (
    <div
      className={`wallet-card__header ${
        dark ? "wallet-card__header--inverted" : ""
      }`}
    >
      {children}
    </div>
  );
};

interface WalletCardContentProps {
  children: React.ReactNode;
}

export const WalletCardContent = ({ children }: WalletCardContentProps) => {
  return <div className="wallet-card__content">{children}</div>;
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
      className={`wallet-card__row ${dark ? "wallet-card__row--dark" : ""} ${
        bold ? "wallet-card__row--bold" : ""
      }`}
      ref={ref}
    >
      {link ? (
        <Link to={link}>{label}</Link>
      ) : (
        <span>{label}</span>
      )}
      {value && (
        <span>
          <span className="wallet-card__price--integer">{integers}.</span>
          <span className="wallet-card__price--decimal">{decimalsPlaces}</span>
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
  return <div className="wallet-card__actions">{children}</div>;
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
    <div
      className={`wallet-card__asset ${dark ? "wallet-card__asset--dark" : ""}`}
    >
      <img
        alt="Vega"
        src={image}
        className={`wallet-card__asset-image ${
          border ? "wallet-card__asset-image--border" : ""
        }`}
      />
      <div className="wallet-card__asset-header">
        <div className="wallet-card__asset-heading">
          <h1>{name}</h1>
          <h2>{subheading || symbol}</h2>
        </div>
        <div className="wallet-card__asset-balance">
          <span className="wallet-card__price--integer">{integers}.</span>
          <span className="wallet-card__price--decimal">{decimalsPlaces}</span>
        </div>
      </div>
    </div>
  );
};
