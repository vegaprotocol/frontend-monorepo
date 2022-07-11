import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getButtonClasses, Button } from '@vegaprotocol/ui-toolkit';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { usePendingTransactions } from '../../hooks/use-pending-transactions';
import vegaVesting from '../../images/vega_vesting.png';
import vegaWhite from '../../images/vega_white.png';
import { BigNumber } from '../../lib/bignumber';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Routes } from '../../routes/router-config';
import { LockedProgress } from '../locked-progress';
import {
  WalletCard,
  WalletCardActions,
  WalletCardAsset,
  WalletCardContent,
  WalletCardHeader,
  WalletCardRow,
} from '../wallet-card';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { theme } from '@vegaprotocol/tailwindcss-config';

const Colors = theme.colors;

const removeLeadingAddressSymbol = (key: string) => {
  if (key && key.length > 2 && key.slice(0, 2) === '0x') {
    return truncateMiddle(key.substring(2));
  }
  return truncateMiddle(key);
};

const AssociatedAmounts = ({
  associations,
  notAssociated,
}: {
  associations: { [key: string]: BigNumber };
  notAssociated: BigNumber;
}) => {
  const { t } = useTranslation();
  const vestingAssociationByVegaKey = React.useMemo(
    () =>
      Object.entries(associations).filter(([, amount]) =>
        amount.isGreaterThan(0)
      ),
    [associations]
  );
  const associationAmounts = React.useMemo(() => {
    const totals = vestingAssociationByVegaKey.map(([, amount]) => amount);
    const associated = BigNumber.sum.apply(null, [new BigNumber(0), ...totals]);

    return {
      total: associated.plus(notAssociated),
      associated,
      notAssociated,
    };
  }, [notAssociated, vestingAssociationByVegaKey]);

  return (
    <>
      <LockedProgress
        locked={associationAmounts.associated}
        unlocked={associationAmounts.notAssociated}
        total={associationAmounts.total}
        leftLabel={t('associated')}
        rightLabel={t('notAssociated')}
        leftColor={Colors.white.DEFAULT}
        rightColor={Colors.black.DEFAULT}
        light={false}
      />
      {vestingAssociationByVegaKey.length ? (
        <div>
          <hr style={{ borderStyle: 'dashed' }} />
          <WalletCardRow
            label="Associated with Vega keys"
            bold={true}
            dark={true}
          />
          {vestingAssociationByVegaKey.map(([key, amount]) => {
            return (
              <WalletCardRow
                key={key}
                label={removeLeadingAddressSymbol(key)}
                value={amount}
                dark={true}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
};

const ConnectedKey = () => {
  const { t } = useTranslation();
  const { appState } = useAppState();
  const { walletBalance, totalLockedBalance, totalVestedBalance } = appState;

  const totalInVestingContract = React.useMemo(() => {
    return totalLockedBalance.plus(totalVestedBalance);
  }, [totalLockedBalance, totalVestedBalance]);

  const notAssociatedInContract = React.useMemo(() => {
    const totals = Object.values(
      appState.associationBreakdown.vestingAssociations
    );
    const associated = BigNumber.sum.apply(null, [new BigNumber(0), ...totals]);
    return totalInVestingContract.minus(associated);
  }, [
    appState.associationBreakdown.vestingAssociations,
    totalInVestingContract,
  ]);

  const walletWithAssociations = React.useMemo(() => {
    const totals = Object.values(
      appState.associationBreakdown.stakingAssociations
    );
    const associated = BigNumber.sum.apply(null, [new BigNumber(0), ...totals]);
    return walletBalance.plus(associated);
  }, [appState.associationBreakdown.stakingAssociations, walletBalance]);

  return (
    <>
      {totalVestedBalance.plus(totalLockedBalance).isEqualTo(0) ? null : (
        <section data-testid="vega-in-vesting-contract">
          <WalletCardAsset
            image={vegaVesting}
            decimals={appState.decimals}
            name="VEGA"
            symbol="In vesting contract"
            balance={totalInVestingContract}
            dark={true}
          />
          <LockedProgress
            locked={totalLockedBalance}
            unlocked={totalVestedBalance}
            total={totalVestedBalance.plus(totalLockedBalance)}
            leftLabel={t('Locked')}
            rightLabel={t('Unlocked')}
            light={false}
          />
        </section>
      )}
      {!Object.keys(appState.associationBreakdown.vestingAssociations)
        .length ? null : (
        <AssociatedAmounts
          associations={appState.associationBreakdown.vestingAssociations}
          notAssociated={notAssociatedInContract}
        />
      )}
      <section data-testid="vega-in-wallet">
        <WalletCardAsset
          image={vegaWhite}
          decimals={appState.decimals}
          name="VEGA"
          symbol="In Wallet"
          balance={walletWithAssociations}
          dark={true}
        />
        {!Object.keys(
          appState.associationBreakdown.stakingAssociations
        ) ? null : (
          <AssociatedAmounts
            associations={appState.associationBreakdown.stakingAssociations}
            notAssociated={walletBalance}
          />
        )}
      </section>
      <WalletCardActions>
        <Link
          className={getButtonClasses('flex-1 mr-4', 'secondary')}
          to={`${Routes.STAKING}/associate`}
        >
          {t('associate')}
        </Link>
        <Link
          className={getButtonClasses('flex-1 ml-4', 'secondary')}
          to={`${Routes.STAKING}/disassociate`}
        >
          {t('disassociate')}
        </Link>
      </WalletCardActions>
    </>
  );
};

export const EthWallet = () => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  const { account, connector } = useWeb3React();
  const pendingTxs = usePendingTransactions();

  return (
    <WalletCard dark={true}>
      <section data-testid="ethereum-wallet">
        <WalletCardHeader>
          <h1 className="text-h3 uppercase">{t('ethereumKey')}</h1>
          {account && (
            <div className="px-4 text-right">
              <div
                className="font-mono"
                data-testid="ethereum-account-truncated"
              >
                {truncateMiddle(account)}
              </div>
              {pendingTxs && (
                <div>
                  <button
                    className="flex items-center gap-4 p-4 border whitespace-nowrap"
                    data-testid="pending-transactions-btn"
                    onClick={() =>
                      appDispatch({
                        type: AppStateActionType.SET_TRANSACTION_OVERLAY,
                        isOpen: true,
                      })
                    }
                  >
                    <Loader size="small" forceTheme="dark" />
                    {t('pendingTransactions')}
                  </button>
                </div>
              )}
            </div>
          )}
        </WalletCardHeader>
        <WalletCardContent>
          {account ? (
            <ConnectedKey />
          ) : (
            <Button
              variant={'secondary'}
              className="w-full px-28 border h-28"
              onClick={() =>
                appDispatch({
                  type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
                  isOpen: true,
                })
              }
              data-testid="connect-to-eth-wallet-button"
            >
              {t('connectEthWalletToAssociate')}
            </Button>
          )}
          {account && (
            <WalletCardActions>
              <button
                className="mt-4 underline"
                onClick={() => connector.deactivate()}
                data-testid="disconnect-from-eth-wallet-button"
              >
                {t('disconnect')}
              </button>
            </WalletCardActions>
          )}
        </WalletCardContent>
      </section>
    </WalletCard>
  );
};
