import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAnimateValue } from '../../hooks/use-animate-value';
import { BigNumber } from '../../lib/bignumber';
import { useNumberParts } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { useTranslation } from 'react-i18next';
import { AnchorButton, ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  CONSOLE_TRANSFER_ASSET,
  DApp,
  DocsLinks,
  getExternalChainShortLabel,
  useLinks,
} from '@vegaprotocol/environment';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import noIcon from '../../images/token-no-icon.png';
import { EmblemByAsset } from '@vegaprotocol/emblem';
import { useWallet } from '@vegaprotocol/wallet-react';

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

export type WalletCardAssetProps = {
  image: string;
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: number;
  assetId?: string;
  chainId?: string;
  border?: boolean;
  subheading?: string;
  type?: Schema.AccountType;
  allowZeroBalance?: boolean;
};

export type WalletCardAssetWithMultipleBalancesProps = Omit<
  WalletCardAssetProps,
  'balance' | 'type'
> & {
  balances: { balance: BigNumber; type?: Schema.AccountType }[];
};

export const WalletCardAsset = ({
  image,
  name,
  symbol,
  decimals,
  assetId,
  chainId,
  border,
  subheading,
  allowZeroBalance = false,
  ...props
}: WalletCardAssetProps | WalletCardAssetWithMultipleBalancesProps) => {
  const balance = 'balance' in props ? props.balance : undefined;
  const type = 'type' in props ? props.type : undefined;
  const balances =
    'balances' in props
      ? props.balances
      : balance
      ? [{ balance, type }]
      : undefined;

  const values =
    balances &&
    balances.length > 0 &&
    balances
      .filter((b) => allowZeroBalance || !b.balance.isZero())
      .sort((a, b) => {
        const order = [
          Schema.AccountType.ACCOUNT_TYPE_VESTING_REWARDS,
          Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS,
          Schema.AccountType.ACCOUNT_TYPE_GENERAL,
          undefined,
        ];
        return order.indexOf(a.type) - order.indexOf(b.type);
      })
      .map(({ balance, type }, i) => (
        <CurrencyValue
          key={i}
          balance={balance}
          decimals={decimals}
          type={type}
          assetId={assetId}
        />
      ));

  const vegaChainId = useWallet((store) => store.chainId);
  if (!values || values.length === 0) return;

  let img = (
    <img
      alt="Vega"
      src={image}
      className={`inline-block w-6 h-6 mt-2 rounded-full border ${
        border ? 'border-white' : 'border-black'
      }`}
    />
  );

  if (image === noIcon && assetId) {
    img = (
      <div className="w-6 h-6">
        <EmblemByAsset asset={assetId} vegaChain={vegaChainId} />
      </div>
    );
  }

  return (
    <div className="flex flex-nowrap gap-2 mt-2 mb-4">
      {img}
      <div>
        <div
          className="flex align-center items-baseline text-base gap-2"
          data-testid="currency-title"
        >
          <div className="mb-0 uppercase">{name}</div>
          <div className="mb-0 uppercase text-neutral-400">
            {subheading || symbol}{' '}
            {chainId && (
              <span className="text-xs">
                {getExternalChainShortLabel(chainId)}
              </span>
            )}
          </div>
        </div>
        {values}
      </div>
    </div>
  );
};

const useAccountTypeTooltip = (type?: Schema.AccountType) => {
  const { t } = useTranslation();
  const { param: baseRate } = useNetworkParam('rewards_vesting_baseRate');
  const accountTypeTooltip = useMemo(() => {
    if (type === Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS) {
      return t('VestedRewardsTooltip');
    }
    if (type === Schema.AccountType.ACCOUNT_TYPE_VESTING_REWARDS && baseRate) {
      return t('VestingRewardsTooltip', {
        baseRate: formatNumberPercentage(new BigNumber(baseRate).times(100)),
      });
    }

    return null;
  }, [baseRate, t, type]);

  return accountTypeTooltip;
};

const CurrencyValue = ({
  balance,
  decimals,
  type,
  assetId,
}: {
  balance: BigNumber;
  decimals: number;
  type?: Schema.AccountType;
  assetId?: string;
}) => {
  const { t } = useTranslation();
  const consoleLink = useLinks(DApp.Console);
  const transferAssetLink = (assetId: string) =>
    consoleLink(CONSOLE_TRANSFER_ASSET.replace(':assetId', assetId));

  const [integers, decimalsPlaces, separator] = useNumberParts(
    balance,
    decimals
  );
  const accountTypeTooltip = useAccountTypeTooltip(type);

  const accountType = type && (
    <Tooltip description={accountTypeTooltip}>
      <span className="px-2 py-1 leading-none text-xs bg-vega-cdark-700 rounded">
        {Schema.AccountTypeMapping[type]}{' '}
        {DocsLinks && (
          <ExternalLink
            href={DocsLinks.HOW_REWARDS_ARE_PAID}
            target="_blank"
            data-testid="rewards-guide-link"
            className="text-white"
          >
            {t('Learn more')}
          </ExternalLink>
        )}
      </span>
    </Tooltip>
  );
  const isRedeemable =
    type === Schema.AccountType.ACCOUNT_TYPE_VESTED_REWARDS && assetId;
  const redeemBtn = isRedeemable ? (
    <Tooltip description={t('RedeemRewardsTooltip')}>
      <AnchorButton
        variant="primary"
        size="xs"
        href={transferAssetLink(assetId)}
        target="_blank"
        className="px-2 py-1 leading-none text-xs bg-vega-yellow text-black rounded"
      >
        {t('Redeem')}
      </AnchorButton>
    </Tooltip>
  ) : null;

  return (
    <div
      className="basis-full font-mono mb-1"
      data-account-type={type?.toLowerCase() || 'unspecified'}
      data-testid="currency-value"
    >
      {type && (
        <div data-type className="flex gap-1">
          {accountType}
          {redeemBtn}
        </div>
      )}
      <div data-value>
        <span>
          {integers}
          {separator}
        </span>
        <span className="text-neutral-400">{decimalsPlaces}</span>
      </div>
    </div>
  );
};
