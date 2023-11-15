import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import vegaWhite from '../../images/vega_white.png';
import { BigNumber } from '../../lib/bignumber';
import { truncateMiddle } from '../../lib/truncate-middle';
import Routes from '../../routes/routes';
import { BulletHeader } from '../bullet-header';
import type {
  WalletCardAssetProps,
  WalletCardAssetWithMultipleBalancesProps,
} from '../wallet-card';
import {
  WalletCard,
  WalletCardActions,
  WalletCardAsset,
  WalletCardContent,
  WalletCardHeader,
  WalletCardRow,
} from '../wallet-card';
import { VegaWalletPrompt } from './vega-wallet-prompt';
import { usePollForDelegations } from './hooks';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Button, ButtonLink } from '@vegaprotocol/ui-toolkit';
import { toBigNum } from '@vegaprotocol/utils';
import { usePendingBalancesStore } from '../../hooks/use-pending-balances-manager';
import { StakingEventType } from '../../hooks/use-get-association-breakdown';
import omit from 'lodash/omit';

export const VegaWallet = () => {
  const { t } = useTranslation();
  const { pubKey, pubKeys } = useVegaWallet();
  const pubKeyObj = useMemo(() => {
    return pubKeys?.find((pk) => pk.publicKey === pubKey);
  }, [pubKey, pubKeys]);

  const child = !pubKeys ? (
    <VegaWalletNotConnected />
  ) : (
    <VegaWalletConnected vegaKeys={pubKeys.map((pk) => pk.publicKey)} />
  );

  return (
    <section className="vega-wallet" data-testid="vega-wallet">
      <WalletCard>
        <WalletCardHeader dark={true}>
          <h1 className="col-start-1 m-0">{t('vegaWallet')}</h1>
          {pubKeyObj && (
            <>
              <div
                data-testid="wallet-name"
                className="sm:row-start-2 sm:col-start-1 sm:col-span-2 text-base mb-4"
              >
                {pubKeyObj.name}
              </div>
              <span
                data-testid="vega-account-truncated"
                className="sm:col-start-2 place-self-end font-mono pb-2 px-4"
              >
                {truncateMiddle(pubKeyObj.publicKey)}
              </span>
            </>
          )}
        </WalletCardHeader>
        <WalletCardContent>{child}</WalletCardContent>
      </WalletCard>
    </section>
  );
};

const VegaWalletNotConnected = () => {
  const { t } = useTranslation();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  return (
    <>
      <Button
        onClick={() => {
          openVegaWalletDialog();
        }}
        fill={true}
        data-testid="connect-vega-wallet"
      >
        {t('connectVegaWalletToUseAssociated')}
      </Button>
      <VegaWalletPrompt />
    </>
  );
};

interface VegaWalletAssetsListProps {
  accounts: WalletCardAssetProps[];
}

const VegaWalletAssetList = ({ accounts }: VegaWalletAssetsListProps) => {
  const { t } = useTranslation();
  if (!accounts.length) {
    return null;
  }

  const groupedByAsset = accounts.reduce((all, a) => {
    const foundIndex = all.findIndex((acc) => acc.assetId === a.assetId);
    if (foundIndex > -1) {
      const found = all[foundIndex];
      all[foundIndex] = {
        ...found,
        balances: [...found.balances, { balance: a.balance, type: a.type }],
      };
      return all;
    }
    const acc = {
      ...omit(a, 'balance', 'type'),
      balances: [{ balance: a.balance, type: a.type }],
    };
    return [...all, acc];
  }, [] as WalletCardAssetWithMultipleBalancesProps[]);
  return (
    <>
      <WalletCardHeader>
        <BulletHeader tag="h2">{t('assets')}</BulletHeader>
      </WalletCardHeader>
      {groupedByAsset.map((a, i) => (
        <WalletCardAsset key={i} {...a} />
      ))}
    </>
  );
};

interface VegaWalletConnectedProps {
  vegaKeys: string[];
}

const VegaWalletConnected = ({ vegaKeys }: VegaWalletConnectedProps) => {
  const pendingBalances = usePendingBalancesStore(
    (state) => state.pendingBalances
  );

  const { t } = useTranslation();
  const {
    appDispatch,
    appState: { decimals },
  } = useAppState();
  const { delegations, currentStakeAvailable, delegatedNodes, accounts } =
    usePollForDelegations();
  const amountRemoved = BigNumber.sum.apply(null, [
    new BigNumber(0),
    ...pendingBalances
      .filter(({ event }) => event === StakingEventType.Stake_Removed)
      .map(({ args }) => toBigNum(args?.[1].toString(), decimals)),
  ]);

  const amountAdded = BigNumber.sum.apply(null, [
    new BigNumber(0),
    ...pendingBalances
      .filter(({ event }) => event === StakingEventType.Stake_Deposited)
      .map(({ args }) => toBigNum(args?.[1].toString(), decimals)),
  ]);
  const totalPending = React.useMemo(
    () => amountRemoved.plus(amountAdded),
    [amountAdded, amountRemoved]
  );
  const pendingStakeAmount = React.useMemo(
    () => currentStakeAvailable.plus(amountAdded).minus(amountRemoved),
    [amountAdded, amountRemoved, currentStakeAvailable]
  );

  const unstaked = React.useMemo(() => {
    const totalDelegated = delegations.reduce<BigNumber>(
      (acc, cur) => acc.plus(toBigNum(cur.amount, decimals)),
      new BigNumber(0)
    );
    return BigNumber.max(currentStakeAvailable.minus(totalDelegated), 0);
  }, [currentStakeAvailable, decimals, delegations]);

  const footer = (
    <div className="flex justify-end">
      <ButtonLink
        data-testid="manage-vega-wallet"
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY,
            isOpen: true,
          })
        }
      >
        Manage
      </ButtonLink>
    </div>
  );

  return vegaKeys.length ? (
    <>
      <WalletCardAsset
        image={vegaWhite}
        decimals={decimals}
        name="VEGA"
        subheading={t('Associated')}
        symbol="VEGA"
        balance={currentStakeAvailable}
        allowZeroBalance={true}
      />
      {totalPending.eq(0) ? null : (
        <>
          <WalletCardAsset
            image={vegaWhite}
            decimals={decimals}
            name="VEGA"
            subheading={t('Pending association')}
            symbol="VEGA"
            balance={totalPending}
            allowZeroBalance={true}
          />
          <WalletCardAsset
            image={vegaWhite}
            decimals={decimals}
            name="VEGA"
            subheading={t('Total associated after pending')}
            symbol="VEGA"
            balance={pendingStakeAmount}
            allowZeroBalance={true}
          />
        </>
      )}
      <div data-testid="vega-wallet-balance-unstaked">
        <WalletCardRow label={t('unstaked')} value={unstaked} />
      </div>
      {delegatedNodes.length ? (
        <WalletCardRow label={t('stakedValidators')} />
      ) : null}
      {delegatedNodes.map((d) => (
        <div key={d.nodeId} data-testid="vega-wallet-balance-staked-validators">
          {d.currentEpochStake && d.currentEpochStake.isGreaterThan(0) && (
            <div data-testid="vega-wallet-balance-this-epoch">
              <WalletCardRow
                label={`${d.name || truncateMiddle(d.nodeId)} ${
                  d.hasStakePending ? `(${t('thisEpoch')})` : ''
                }`}
                link={`${Routes.VALIDATORS}/${d.nodeId}`}
                value={d.currentEpochStake}
              />
            </div>
          )}
          {d.hasStakePending && (
            <div data-testid="vega-wallet-balance-next-epoch">
              <WalletCardRow
                label={`${d.name || truncateMiddle(d.nodeId)} (${t(
                  'nextEpoch'
                )})`}
                link={`${Routes.VALIDATORS}/${d.nodeId}`}
                value={d.nextEpochStake}
              />
            </div>
          )}
        </div>
      ))}
      <WalletCardActions>
        <Link className="flex-1" to={Routes.PROPOSALS}>
          <Button size="sm" fill={true}>
            {t('governance')}
          </Button>
        </Link>
        <Link className="flex-1" to={Routes.VALIDATORS}>
          <Button size="sm" fill={true}>
            {t('staking')}
          </Button>
        </Link>
      </WalletCardActions>
      <VegaWalletAssetList accounts={accounts} />
      {footer}
    </>
  ) : (
    <WalletCardContent>{t('noKeys')}</WalletCardContent>
  );
};
