import { useBalances } from '../../../lib/balances/balances-store';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { TransactionCallout } from '../../../components/transaction-callout';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import { useRefreshBalances } from '../../../hooks/use-refresh-balances';
import { useTransaction } from '../../../hooks/use-transaction';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import Routes from '../../routes';
import { TrancheTable } from '../tranche-table';
import { useTranches } from '../../../lib/tranches/tranches-store';
import { useWeb3React } from '@web3-react/core';
import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import { useUserTrancheBalances } from '../hooks';
import { useAppState } from '../../../contexts/app-state/app-state-context';

type Params = { id: string };

export const RedeemFromTranche = () => {
  const { account: address } = useWeb3React();
  const { vesting } = useContracts();
  const { t } = useTranslation();
  const {
    appState: { decimals },
  } = useAppState();
  const { lien, totalVestedBalance, totalLockedBalance } = useBalances();
  const refreshBalances = useRefreshBalances(address || '');
  const { tranches, getTranches } = useTranches((state) => ({
    tranches: state.tranches,
    getTranches: state.getTranches,
  }));
  const { id } = useParams<Params>();
  const numberId = Number(id);
  const tranche = React.useMemo(
    () => tranches?.find(({ tranche_id }) => tranche_id === numberId) || null,
    [numberId, tranches]
  );
  const {
    state: txState,
    perform,
    dispatch: txDispatch,
  } = useTransaction(() => vesting.withdraw_from_tranche(numberId));
  const { token } = useContracts();
  const trancheBalances = useUserTrancheBalances(address || '');
  const redeemedAmount = React.useMemo(() => {
    return (
      trancheBalances.find(({ id: bId }) => bId.toString() === id?.toString())
        ?.vested || new BigNumber(0)
    );
    // Do not update this value as it is updated once the tranches are refetched on success and we want the old value
    // so do not react to anything
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // If the claim has been committed refetch the new VEGA balance
  React.useEffect(() => {
    if (txState.txState === TxState.Complete && address) {
      refreshBalances();
      getTranches(decimals);
    }
  }, [address, decimals, getTranches, refreshBalances, txState.txState]);

  const trancheBalance = React.useMemo(() => {
    return trancheBalances.find(
      ({ id: bId }) => bId.toString() === id?.toString()
    );
  }, [id, trancheBalances]);

  if (!address) {
    return <EthConnectPrompt />;
  }

  if (
    !tranche ||
    tranche.total_removed.isEqualTo(tranche.total_added) ||
    !trancheBalance
  ) {
    return (
      <section data-testid="redemption-page" className="mb-28">
        <p data-testid="redemption-no-balance">
          <Trans
            i18nKey="noVestingTokens"
            components={{
              tranchesLink: (
                <Link className="text-white underline" to={Routes.SUPPLY} />
              ),
            }}
          />
        </p>
      </section>
    );
  }

  return (
    <section className="redemption-tranche" data-testid="redemption-tranche">
      {txState.txState !== TxState.Default ? (
        <TransactionCallout
          completeHeading={
            <strong className={'text-white'}>
              {t('Tokens from this Tranche have been redeemed')}
            </strong>
          }
          completeBody={
            <>
              <p>
                {t(
                  'You have redeemed {{redeemedAmount}} VEGA tokens from this tranche. They are now free to transfer from your Ethereum wallet.',
                  {
                    redeemedAmount: formatNumber(redeemedAmount),
                  }
                )}
              </p>
              <p>
                {t(
                  'The VEGA token address is {{address}}, make sure you add this to your wallet to see your tokens',
                  {
                    address: token.address,
                  }
                )}
              </p>
              <p>
                <Trans
                  i18nKey="Go to <stakingLink>staking</stakingLink> or <governanceLink>governance</governanceLink> to see how you can use your unlocked tokens"
                  components={{
                    stakingLink: (
                      <Link
                        className="text-white underline"
                        to={Routes.VALIDATORS}
                      />
                    ),
                    governanceLink: (
                      <Link
                        className="text-white underline"
                        to={Routes.PROPOSALS}
                      />
                    ),
                  }}
                />
              </p>
            </>
          }
          state={txState}
          reset={() => txDispatch({ type: TransactionActionType.TX_RESET })}
        />
      ) : (
        <TrancheTable
          totalVested={totalVestedBalance}
          totalLocked={totalLockedBalance}
          tranche={tranche}
          lien={lien}
          locked={trancheBalance.locked}
          vested={trancheBalance.vested}
          onClick={perform}
          address={address || ''}
        />
      )}
    </section>
  );
};

export default RedeemFromTranche;
