import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@vegaprotocol/ui-toolkit';
import { DisconnectedNotice } from '../disconnected-notice';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { usePendingTransactions } from '../../hooks/use-pending-transactions';
import vegaVesting from '../../images/vega_vesting.png';
import vegaWhite from '../../images/vega_white.png';
import { BigNumber } from '../../lib/bignumber';
import { truncateMiddle } from '../../lib/truncate-middle';
import Routes from '../../routes/routes';
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
import colors from 'tailwindcss/colors';
import { useBalances } from '../../lib/balances/balances-store';
import {
  useEthereumConfig,
  useWeb3ConnectStore,
  useWeb3Disconnect,
} from '@vegaprotocol/web3';
import { getChainName } from '@vegaprotocol/web3';

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
        leftColor={colors.white}
        rightColor={colors.black}
      />
      {vestingAssociationByVegaKey.length ? (
        <div className="pt-2 border-t border-dashed">
          <WalletCardRow label="Associated with Vega keys" />
          {vestingAssociationByVegaKey.map(([key, amount], i) => {
            return (
              <div data-testid="eth-wallet-associated-balances" key={i}>
                <WalletCardRow
                  key={key}
                  label={removeLeadingAddressSymbol(key)}
                  value={amount}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

const ConnectedKey = () => {
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const {
    walletBalance,
    totalLockedBalance,
    totalVestedBalance,
    associationBreakdown,
  } = useBalances();

  const totalInVestingContract = React.useMemo(() => {
    return totalLockedBalance.plus(totalVestedBalance);
  }, [totalLockedBalance, totalVestedBalance]);

  const notAssociatedInContract = React.useMemo(() => {
    const totals = Object.values(associationBreakdown.vestingAssociations);
    const associated = BigNumber.sum.apply(null, [new BigNumber(0), ...totals]);
    return totalInVestingContract.minus(associated);
  }, [associationBreakdown.vestingAssociations, totalInVestingContract]);

  const walletWithAssociations = React.useMemo(() => {
    const totals = Object.values(associationBreakdown.stakingAssociations);
    const associated = BigNumber.sum.apply(null, [new BigNumber(0), ...totals]);
    return walletBalance.plus(associated);
  }, [associationBreakdown.stakingAssociations, walletBalance]);

  return (
    <>
      <section data-testid="vega-in-vesting-contract">
        {totalVestedBalance.plus(totalLockedBalance).isEqualTo(0) ? null : (
          <section>
            <WalletCardAsset
              image={vegaVesting}
              decimals={decimals}
              name="VEGA"
              symbol="In vesting contract"
              balance={totalInVestingContract}
            />
            <LockedProgress
              locked={totalLockedBalance}
              unlocked={totalVestedBalance}
              total={totalVestedBalance.plus(totalLockedBalance)}
              leftLabel={t('Locked')}
              rightLabel={t('Unlocked')}
            />
          </section>
        )}
        {!Object.keys(associationBreakdown.vestingAssociations)
          .length ? null : (
          <AssociatedAmounts
            associations={associationBreakdown.vestingAssociations}
            notAssociated={notAssociatedInContract}
          />
        )}
      </section>
      <section data-testid="vega-in-wallet">
        <WalletCardAsset
          image={vegaWhite}
          decimals={decimals}
          name="VEGA"
          symbol="In Wallet"
          balance={walletWithAssociations}
        />
        {!Object.keys(associationBreakdown.stakingAssociations) ? null : (
          <AssociatedAmounts
            associations={associationBreakdown.stakingAssociations}
            notAssociated={walletBalance}
          />
        )}
      </section>
      <WalletCardActions>
        <Link className="flex-1" to={Routes.ASSOCIATE}>
          <Button data-testid="associate-btn" size="sm" fill={true}>
            {t('associate')}
          </Button>
        </Link>
        <Link className="flex-1" to={Routes.DISASSOCIATE}>
          <Button size="sm" fill={true}>
            {t('disassociate')}
          </Button>
        </Link>
      </WalletCardActions>
    </>
  );
};

export const EthWallet = () => {
  const { t } = useTranslation();
  const { appDispatch, appState } = useAppState();
  const { account, connector } = useWeb3React();
  const pendingTxs = usePendingTransactions();
  const disconnect = useWeb3Disconnect(connector);
  const { config } = useEthereumConfig();
  const { open } = useWeb3ConnectStore();

  return (
    <WalletCard>
      <section data-testid="ethereum-wallet">
        <WalletCardHeader>
          <h1 className="m-0 uppercase">{t('ethereumKey')}</h1>
          <DisconnectedNotice
            isDisconnected={appState.disconnectNotice}
            correctNetworkChainId={getChainName(Number(config?.chain_id))}
          />
          {account && (
            <div className="place-self-end font-mono">
              <div
                className="font-mono"
                data-testid="ethereum-account-truncated"
              >
                {truncateMiddle(account)}
              </div>
              {pendingTxs && (
                <div>
                  <button
                    className="flex items-center gap-1 p-1 border whitespace-nowrap"
                    data-testid="pending-transactions-btn"
                    onClick={() =>
                      appDispatch({
                        type: AppStateActionType.SET_TRANSACTION_OVERLAY,
                        isOpen: true,
                      })
                    }
                  >
                    <Loader size="small" />
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
              fill={true}
              onClick={() => open()}
              data-testid="connect-to-eth-wallet-button"
            >
              {t('connectEthWalletToAssociate')}
            </Button>
          )}
          {account && (
            <div className="flex justify-end">
              <button
                className="underline"
                onClick={() => disconnect()}
                data-testid="disconnect-from-eth-wallet-button"
              >
                {t('disconnect')}
              </button>
            </div>
          )}
        </WalletCardContent>
      </section>
    </WalletCard>
  );
};
