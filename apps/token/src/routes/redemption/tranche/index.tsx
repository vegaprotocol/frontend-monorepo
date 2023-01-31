import { useBalances } from '../../../lib/balances/balances-store';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams, useOutletContext } from 'react-router-dom';

import { TransactionCallout } from '../../../components/transaction-callout';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import {
  TransactionActionType,
  TxState,
} from '../../../hooks/transaction-reducer';
import { useGetUserTrancheBalances } from '../../../hooks/use-get-user-tranche-balances';
import { useRefreshBalances } from '../../../hooks/use-refresh-balances';
import { useTransaction } from '../../../hooks/use-transaction';
import { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import Routes from '../../routes';
import type { RedemptionState } from '../redemption-reducer';
import { TrancheTable } from '../tranche-table';

export const RedeemFromTranche = () => {
  const { state, address } = useOutletContext<{
    state: RedemptionState;
    address: string;
  }>();
  const { vesting } = useContracts();
  const { t } = useTranslation();
  const { lien, totalVestedBalance, trancheBalances, totalLockedBalance } =
    useBalances();
  const refreshBalances = useRefreshBalances(address);
  const getUserTrancheBalances = useGetUserTrancheBalances(address, vesting);
  const { id } = useParams<{ id: string }>();
  const numberId = Number(id);
  const { userTranches } = state;
  const tranche = React.useMemo(
    () => userTranches.find(({ tranche_id }) => tranche_id === numberId),
    [numberId, userTranches]
  );
  const {
    state: txState,
    perform,
    dispatch: txDispatch,
  } = useTransaction(() => vesting.withdraw_from_tranche(numberId));
  const { token } = useContracts();

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
      getUserTrancheBalances();
      refreshBalances();
    }
  }, [address, getUserTrancheBalances, refreshBalances, txState.txState]);

  const trancheBalance = React.useMemo(() => {
    return trancheBalances.find(
      ({ id: bId }) => bId.toString() === id?.toString()
    );
  }, [id, trancheBalances]);

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
                <Link className="underline text-white" to={Routes.SUPPLY} />
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
                        className="underline text-white"
                        to={Routes.VALIDATORS}
                      />
                    ),
                    governanceLink: (
                      <Link
                        className="underline text-white"
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
        />
      )}
    </section>
  );
};

export default RedeemFromTranche;
