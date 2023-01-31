import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useBalances } from '../../../lib/balances/balances-store';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import { AddLockedTokenAddress } from '../../../components/add-locked-token';
import { formatNumber } from '../../../lib/format-number';
import { truncateMiddle } from '../../../lib/truncate-middle';
import Routes from '../../routes';
import { Tranche0Table, TrancheTable } from '../tranche-table';
import { VestingTable } from './vesting-table';
import { Tranche, useTranches } from '../../../lib/tranches/tranches-store';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { useGetUserBalances } from '../../../hooks/use-get-user-balances';
import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useAppState } from 'apps/token/src/contexts/app-state/app-state-context';

interface UserBalances {
  balanceFormatted: BigNumber;
  walletBalance: BigNumber;
  lien: BigNumber;
  allowance: BigNumber;
  balance: BigNumber;
}

const useUserTrancheBalances = (address: string) => {
  const [userTrancheBalances, setUserTrancheBalances] = useState<
    {
      id: number;
      locked: BigNumber;
      vested: BigNumber;
    }[]
  >([]);
  const {
    appState: { decimals },
  } = useAppState();
  const { vesting } = useContracts();
  const tranches = useTranches((state) => state.tranches);
  const loadUserTrancheBalances = useCallback(async () => {
    const userTranches =
      tranches?.filter((t) =>
        t.users.some(
          (a) => a && address && a.toLowerCase() === address.toLowerCase()
        )
      ) || [];
    const trancheIds = userTranches.map((t) => t.tranche_id);
    const promises = trancheIds.map(async (tId) => {
      const [t, v] = await Promise.all([
        vesting.get_tranche_balance(address, tId),
        vesting.get_vested_for_tranche(address, tId),
      ]);

      const total = toBigNum(t, decimals);
      const vested = toBigNum(v, decimals);

      return {
        id: tId,
        locked: tId === 0 ? total : total.minus(vested),
        vested: tId === 0 ? new BigNumber(0) : vested,
      };
    });

    const trancheBalances = await Promise.all(promises);
    setUserTrancheBalances(trancheBalances);
  }, [address, decimals, tranches, vesting]);
  useEffect(() => {
    loadUserTrancheBalances();
  }, [loadUserTrancheBalances]);
  return userTrancheBalances;
};

export const RedemptionInformation = () => {
  const tranches = useTranches((state) => state.tranches);
  const { account } = useOutletContext<{
    account: string;
  }>();
  const [userBalances, setUserBalances] = useState<null | UserBalances>();
  const getUsersBalances = useGetUserBalances(account);
  useEffect(() => {
    getUsersBalances().then(setUserBalances);
  }, [getUsersBalances]);
  const userTrancheBalances = useUserTrancheBalances(account);
  const filteredTranches = React.useMemo(
    () =>
      tranches?.filter((tr) => {
        const balance = userTrancheBalances.find(
          ({ id }) => id.toString() === tr.tranche_id.toString()
        );
        return (
          balance?.locked.isGreaterThan(0) || balance?.vested.isGreaterThan(0)
        );
      }) || [],
    [userTrancheBalances, tranches]
  );

  // // TODO do I need this with new API?
  const zeroTranche = React.useMemo(() => {
    const zeroTranche = userTrancheBalances.find((t) => t.id === 0);
    if (zeroTranche && zeroTranche.locked.isGreaterThan(0)) {
      return zeroTranche;
    }
    return null;
  }, [userTrancheBalances]);

  if (!filteredTranches.length || !userBalances) {
    return (
      <section data-testid="redemption-page">
        <div className="mb-8">
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
        </div>
        <AddLockedTokenAddress />
      </section>
    );
  }

  return (
    <section data-testid="redemption-page">
      <div className="mb-12">
        <AddLockedTokenAddress />
      </div>
      <p className="mb-24" data-testid="redemption-description">
        {t(
          '{{address}} has {{balance}} VEGA tokens in {{tranches}} tranches of the vesting contract.',
          {
            address: truncateMiddle(account),
            balance: formatNumber(userBalances.balanceFormatted),
            tranches: filteredTranches.length,
          }
        )}
      </p>
      <div className="mb-24">
        <VestingTable
          associated={userBalances.lien}
          locked={userBalances.totalLockedBalance}
          vested={userBalances.totalVestedBalance}
        />
      </div>
      {filteredTranches.length ? <h2>{t('Tranche breakdown')}</h2> : null}
      {zeroTranche && (
        <Tranche0Table
          trancheId={0}
          total={
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userTrancheBalances.find(
              ({ id }) => id.toString() === zeroTranche.id.toString()
            )!.locked
          }
        />
      )}
      {filteredTranches.map((tr) => (
        <TrancheTable
          key={tr.tranche_id}
          tranche={tr}
          lien={userBalances.lien}
          locked={
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userTrancheBalances.find(
              ({ id }) => id.toString() === tr.tranche_id.toString()
            )!.locked
          }
          vested={
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userTrancheBalances.find(
              ({ id }) => id.toString() === tr.tranche_id.toString()
            )!.vested
          }
          totalVested={userBalances.totalVestedBalance}
          totalLocked={userBalances.totalLockedBalance}
          onClick={() => navigate(`/vesting/${tr.tranche_id}`)}
        />
      ))}
      <Callout
        title={t('Stake your Locked VEGA tokens!')}
        iconName="hand-up"
        intent={Intent.Warning}
      >
        <p>{t('Find out more about Staking.')}</p>
        <Link to="/staking" className="underline text-white">
          {t('Stake VEGA tokens')}
        </Link>
      </Callout>
    </section>
  );
};

export default RedemptionInformation;
