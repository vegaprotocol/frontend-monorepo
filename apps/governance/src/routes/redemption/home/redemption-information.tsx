import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AddLockedTokenAddress } from '../../../components/add-locked-token';
import { formatNumber } from '../../../lib/format-number';
import { truncateMiddle } from '../../../lib/truncate-middle';
import Routes from '../../routes';
import { Tranche0Table, TrancheTable } from '../tranche-table';
import { VestingTable } from './vesting-table';
import { useTranches } from '../../../lib/tranches/tranches-store';
import { useGetUserBalances } from '../../../hooks/use-get-user-balances';
import BigNumber from 'bignumber.js';
import { useUserTrancheBalances } from '../hooks';

interface UserBalances {
  balanceFormatted: BigNumber;
  walletBalance: BigNumber;
  lien: BigNumber;
  allowance: BigNumber;
  balance: BigNumber;
}

type Params = { address: string };

export const RedemptionInformation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tranches = useTranches((state) => state.tranches);
  const { address } = useParams<Params>();
  const [userBalances, setUserBalances] = useState<null | UserBalances>();
  const getUsersBalances = useGetUserBalances(address);
  useEffect(() => {
    getUsersBalances().then(setUserBalances);
  }, [getUsersBalances]);
  const userTrancheBalances = useUserTrancheBalances(address);
  const filteredTranches = useMemo(
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
  const { totalLocked, totalVested } = useMemo(() => {
    return {
      totalLocked: BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...userTrancheBalances.map(({ locked }) => locked),
      ]),
      totalVested: BigNumber.sum.apply(null, [
        new BigNumber(0),
        ...userTrancheBalances.map(({ vested }) => vested),
      ]),
    };
  }, [userTrancheBalances]);

  const zeroTranche = useMemo(() => {
    const zeroTranche = userTrancheBalances.find((t) => t.id === 0);
    if (zeroTranche && zeroTranche.locked.isGreaterThan(0)) {
      return zeroTranche;
    }
    return null;
  }, [userTrancheBalances]);

  const isAccountValid = useMemo(
    () => address && address.length === 42 && address.startsWith('0x'),
    [address]
  );

  if (!isAccountValid || !address) {
    return <div>The address {address} is not a valid Ethereum address</div>;
  }

  if (!filteredTranches.length || !userBalances) {
    return (
      <section data-testid="redemption-page">
        <div className="mb-8">
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
            address: truncateMiddle(address),
            balance: formatNumber(userBalances.balanceFormatted),
            tranches: filteredTranches.length,
          }
        )}
      </p>
      <div className="mb-24">
        <VestingTable
          associated={userBalances.lien}
          locked={totalLocked}
          vested={totalVested}
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
          totalVested={totalVested}
          totalLocked={totalLocked}
          onClick={() =>
            navigate(`${Routes.REDEEM}/${address}/${tr.tranche_id}`)
          }
          address={address}
        />
      ))}
      <Callout
        title={t('Stake your Locked VEGA tokens!')}
        iconName="hand-up"
        intent={Intent.Warning}
      >
        <p>{t('Find out more about Staking.')}</p>
        <Link to={Routes.VALIDATORS} className="text-white underline">
          {t('Stake VEGA tokens')}
        </Link>
      </Callout>
    </section>
  );
};

export default RedemptionInformation;
