import { Callout, Intent } from '@vegaprotocol/ui-toolkit';
import { useBalances } from '../../../lib/balances/balances-store';
import React, { useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import { AddLockedTokenAddress } from '../../../components/add-locked-token';
import { formatNumber } from '../../../lib/format-number';
import { truncateMiddle } from '../../../lib/truncate-middle';
import Routes from '../../routes';
import { Tranche0Table, TrancheTable } from '../tranche-table';
import { VestingTable } from './vesting-table';
import type { Tranche } from '../../../hooks/use-tranches';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { useGetUserTrancheBalances } from '../../../hooks/use-get-user-tranche-balances';

export const RedemptionInformation = () => {
  const { account, tranches } = useOutletContext<{
    tranches: Tranche[];
    account: string;
  }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    balanceFormatted,
    lien,
    totalVestedBalance,
    totalLockedBalance,
    trancheBalances,
  } = useBalances();
  const { vesting } = useContracts();
  const getUserTrancheBalances = useGetUserTrancheBalances(account, vesting);
  useEffect(() => {
    getUserTrancheBalances().then(console.log);
  }, [account, getUserTrancheBalances]);

  const filteredTranches = useMemo(() => {
    return (
      tranches?.filter((t) =>
        t.users.some((a) => a.toLowerCase() === account.toLowerCase())
      ) || []
    );
  }, [account, tranches]);
  console.log(filteredTranches);
  // const filteredTranches = React.useMemo(
  //   () =>
  //     userTranches.filter((tr) => {
  //       const balance = trancheBalances.find(
  //         ({ id }) => id.toString() === tr.tranche_id.toString()
  //       );
  //       return (
  //         balance?.locked.isGreaterThan(0) || balance?.vested.isGreaterThan(0)
  //       );
  //     }),
  //   [trancheBalances, userTranches]
  // );

  const zeroTranche = React.useMemo(() => {
    const zeroTranche = trancheBalances.find((t) => t.id === 0);
    if (zeroTranche && zeroTranche.locked.isGreaterThan(0)) {
      return zeroTranche;
    }
    return null;
  }, [trancheBalances]);
  return null;
  // if (!filteredTranches.length) {
  //   return (
  //     <section data-testid="redemption-page">
  //       <div className="mb-8">
  //         <p data-testid="redemption-no-balance">
  //           <Trans
  //             i18nKey="noVestingTokens"
  //             components={{
  //               tranchesLink: (
  //                 <Link className="underline text-white" to={Routes.SUPPLY} />
  //               ),
  //             }}
  //           />
  //         </p>
  //       </div>
  //       <AddLockedTokenAddress />
  //     </section>
  //   );
  // }

  // return (
  //   <section data-testid="redemption-page">
  //     <div className="mb-12">
  //       <AddLockedTokenAddress />
  //     </div>
  //     <p className="mb-24" data-testid="redemption-description">
  //       {t(
  //         '{{address}} has {{balance}} VEGA tokens in {{tranches}} tranches of the vesting contract.',
  //         {
  //           address: truncateMiddle(account),
  //           balance: formatNumber(balanceFormatted),
  //           tranches: filteredTranches.length,
  //         }
  //       )}
  //     </p>
  //     <div className="mb-24">
  //       <VestingTable
  //         associated={lien}
  //         locked={totalLockedBalance}
  //         vested={totalVestedBalance}
  //       />
  //     </div>
  //     {filteredTranches.length ? <h2>{t('Tranche breakdown')}</h2> : null}
  //     {zeroTranche && (
  //       <Tranche0Table
  //         trancheId={0}
  //         total={
  //           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //           trancheBalances.find(
  //             ({ id }) => id.toString() === zeroTranche.id.toString()
  //           )!.locked
  //         }
  //       />
  //     )}
  //     {filteredTranches.map((tr) => (
  //       <TrancheTable
  //         key={tr.tranche_id}
  //         tranche={tr}
  //         lien={lien}
  //         locked={
  //           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //           trancheBalances.find(
  //             ({ id }) => id.toString() === tr.tranche_id.toString()
  //           )!.locked
  //         }
  //         vested={
  //           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //           trancheBalances.find(
  //             ({ id }) => id.toString() === tr.tranche_id.toString()
  //           )!.vested
  //         }
  //         totalVested={totalVestedBalance}
  //         totalLocked={totalLockedBalance}
  //         onClick={() => navigate(`/vesting/${tr.tranche_id}`)}
  //       />
  //     ))}
  //     <Callout
  //       title={t('Stake your Locked VEGA tokens!')}
  //       iconName="hand-up"
  //       intent={Intent.Warning}
  //     >
  //       <p>{t('Find out more about Staking.')}</p>
  //       <Link to="/staking" className="underline text-white">
  //         {t('Stake VEGA tokens')}
  //       </Link>
  //     </Callout>
  //   </section>
  // );
};

export default RedemptionInformation;
